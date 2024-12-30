from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import json
from products.models import Product, ProductVariant
from .models import Order, OrderItem, Payment, OrderItemStatus
from .serializer import OrderSerializer, OrderItemSerializer
from django.db.models import F, Sum
from .utils import generate_order_id, generate_order_item_id
from accounts.models import Address
from django.shortcuts import get_object_or_404
from django.conf import settings

# Initialize custom payment handler


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addToCart(request, productId):
    try:
        product = Product.objects.get(productId=productId)
        
        # Get quantity, default is 1
        qty = request.data.get('qty', 1)
        if not isinstance(qty, int) or qty < 1:
            return Response({
                'status': 'error',
                'message': 'Quantity must be a positive integer'
            }, status=400)
        
        # Parse variant IDs from the request
        variant_ids = request.data.get('variant_ids', [])
        print(f"Variant IDs: {variant_ids}")  # Debug log
        
        if not isinstance(variant_ids, list):
            return Response({
                'status': 'error',
                'message': 'Invalid format for variants'
            }, status=400)
        
        # Get or create an active order for the user
        order, created = Order.objects.get_or_create(
            user=request.user,
            is_ordered=False,
            defaults={'orderId': generate_order_id()}
        )
        print(f"Order {'created' if created else 'found'}: {order.orderId}")  # Debug log

        # Check for existing order items
        existing_items = OrderItem.objects.filter(
            user=request.user,
            product=product,
            is_ordered=False
        )
        print(f"Found {existing_items.count()} existing items")  # Debug log

        # Compare variants to find a matching item
        matching_item = None
        for item in existing_items:
            existing_variant_ids = set(item.productVariant.values_list('id', flat=True))
            if existing_variant_ids == set(variant_ids):  
                matching_item = item
                break

        if matching_item:
            print(f"Updating existing item: {matching_item.orderItemId}")  # Debug log
            # Update quantity of the existing item
            matching_item.qty += qty
            matching_item.save()
        else:
            print("Creating new order item")  # Debug log
            # Create a new order item
            new_item = OrderItem.objects.create(
                orderItemId=generate_order_item_id(),
                user=request.user,
                product=product,
                qty=qty
            )
            
            # Add selected variants
            if variant_ids:
                variants = ProductVariant.objects.filter(id__in=variant_ids)
                print(f"Adding variants: {list(variants.values_list('id', flat=True))}")  # Debug log
                new_item.productVariant.set(variants)
            
            # Add the new item to the order
            order.orderItems.add(new_item)

        # Serialize the updated order
        serialized_order = OrderSerializer(order)
        return Response({
            'status': 'success',
            'message': 'Product added to cart successfully',
            'data': serialized_order.data
        })

    except Product.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Product not found'
        }, status=404)
    except Exception as e:
        print(f"Error in addToCart: {str(e)}")  # Debug log
        return Response({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cartView(request):
    try:
        print(f"Fetching cart for user: {request.user.username}")  # Debug log
        order = Order.objects.filter(user=request.user, is_ordered=False).first()
        
        if not order:
            print("No active order found")  # Debug log
            return Response({
                'status': 'success',
                'message': 'Cart is empty',
                'data': {
                    'orderItems': [],
                    'orderTotal': 0
                }
            })
        
        print(f"Found order with {order.orderItems.count()} items")  # Debug log
        serialized_order = OrderSerializer(order)
        return Response({
            'status': 'success',
            'message': 'Cart retrieved successfully',
            'data': serialized_order.data
        })
    except Exception as e:
        print(f"Error in cartView: {str(e)}")  # Debug log
        return Response({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }, status=500)


@api_view(['PUT', 'POST'])
@permission_classes([IsAuthenticated])
def updateOrderQty(request, orderItemId):
    try:
        method = request.data.get('method')
        if method not in ['increment', 'decrement']:
            return Response({
                'status': 'error',
                'message': 'Invalid method'
            }, status=400)
        order_item = OrderItem.objects.get(orderItemId=orderItemId)
        if method == 'increment':
            order_item.qty = F('qty') + 1
        elif method == 'decrement':
            order_item.qty = F('qty') - 1
        order_item.save()
        return Response({
            'status': 'success',
            'message': 'Quantity updated successfully'
        })
    except OrderItem.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Order item not found'
        }, status=404)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }, status=500)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def removeFromCart(request, orderItemId):
    try:
        order_item = OrderItem.objects.get(orderItemId=orderItemId)
        order_item.delete()
        return Response({
            'status': 'success',
            'message': 'Item removed from cart successfully'
        })
    except OrderItem.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Order item not found'
        }, status=404)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_orders(request):
    try:
        orders = Order.objects.filter(user=request.user, is_ordered=True).order_by('-created_at')
        orders_data = []
        
        for order in orders:
            order_items = order.orderitem_set.all()
            total_items = order_items.count()
            total_amount = order_items.aggregate(
                total=Sum(F('quantity') * F('price'))
            )['total'] or 0
            
            items_data = []
            for item in order_items:
                items_data.append({
                    'id': item.id,
                    'product_name': item.product.name,
                    'product_image': request.build_absolute_uri(item.product.image.url) if item.product.image else None,
                    'quantity': item.quantity,
                    'price': item.price,
                    'subtotal': item.quantity * item.price
                })
            
            orders_data.append({
                'id': order.id,
                'order_number': order.order_number,
                'status': order.status,
                'created_at': order.created_at,
                'shipping_address': {
                    'street_address': order.shipping_address.street_address,
                    'apartment': order.shipping_address.apartment,
                    'city': order.shipping_address.city,
                    'state': order.shipping_address.state,
                    'postal_code': order.shipping_address.postal_code,
                } if order.shipping_address else None,
                'payment_status': order.payment_status,
                'payment_method': order.payment_method,
                'total_items': total_items,
                'total_amount': total_amount,
                'items': items_data
            })
        
        return Response({
            'status': 'success',
            'data': orders_data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_detail(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
        order_items = order.orderitem_set.all()
        
        items_data = []
        for item in order_items:
            items_data.append({
                'id': item.id,
                'product': {
                    'id': item.product.id,
                    'name': item.product.name,
                    'description': item.product.description,
                    'image': request.build_absolute_uri(item.product.image.url) if item.product.image else None,
                    'price': item.product.price,
                    'category': item.product.category.name if item.product.category else None,
                },
                'quantity': item.quantity,
                'price': item.price,
                'subtotal': item.quantity * item.price,
                'status': item.status,
                'created_at': item.created_at
            })
        
        order_data = {
            'id': order.id,
            'order_number': order.order_number,
            'status': order.status,
            'created_at': order.created_at,
            'shipping_address': {
                'street_address': order.shipping_address.street_address,
                'apartment': order.shipping_address.apartment,
                'city': order.shipping_address.city,
                'state': order.shipping_address.state,
                'postal_code': order.shipping_address.postal_code,
            } if order.shipping_address else None,
            'billing_address': {
                'street_address': order.billing_address.street_address,
                'apartment': order.billing_address.apartment,
                'city': order.billing_address.city,
                'state': order.billing_address.state,
                'postal_code': order.billing_address.postal_code,
            } if order.billing_address else None,
            'payment_status': order.payment_status,
            'payment_method': order.payment_method,
            'total_amount': sum(item['subtotal'] for item in items_data),
            'items': items_data,
            'notes': order.notes
        }
        
        return Response({
            'status': 'success',
            'data': order_data
        })
    except Order.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Order not found'
        }, status=404)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)





@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    try:
        shipping_address_id = request.data.get('shipping_address_id')
        payment_method = request.data.get('payment_method')

        if not shipping_address_id:
            return Response({
                'status': 'error',
                'message': 'Shipping address is required'
            }, status=400)

        if payment_method not in ['cod', 'card']:
            return Response({
                'status': 'error',
                'message': 'Invalid payment method'
            }, status=400)

        # Get shipping address
        shipping_address = Address.objects.filter(id=shipping_address_id, user=request.user).first()
        if not shipping_address:
            return Response({
                'status': 'error',
                'message': 'Invalid shipping address'
            }, status=400)

        # Get cart items
        cart_items = OrderItem.objects.filter(user=request.user, is_ordered=False)
        if not cart_items:
            return Response({
                'status': 'error',
                'message': 'No items in cart'
            }, status=400)

        order = Order.objects.get(user=request.user, is_ordered=False)
        # Add items to order
        for item in cart_items:
            # Create initial status for each item
            status = OrderItemStatus.objects.create(
                status='pending',
                orderItem=item
            )

            item.shipping_address = shipping_address
            item.order = order
            item.is_ordered = True
            item.currentStatus = status
            item.allStatus.add(status)
            item.save()

            # Update product stock and sold count
            product = item.product
            product.stock -= item.qty
            product.sold += item.qty
            product.save()

            if payment_method == 'cod':
                payment = Payment.objects.create(
                    paymentId=f"PAY_{order.orderId}",
                    user=request.user,
                    orderItem=item, 
                    amount=item.getOrderItemTotal(),
                    paymentMethod='cod',
                  
                )

        order.is_ordered = True
        order.save()


        return Response({
            'status': 'success',
            'data': {
                'orderId': order.orderId,
                'message': 'Order placed successfully'
            }
        })

    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_payment(request):
    try:
        order_id = request.data.get('order_id')
        card_number = request.data.get('card_number')
        expiry_date = request.data.get('expiry_date')
        cvv = request.data.get('cvv')
        amount = request.data.get('amount')

        print(f"Received payment details: order_id={order_id}, card_number={card_number}, expiry_date={expiry_date}, cvv={cvv}, amount={amount}")

        # Validate input
        if not all([order_id, card_number, expiry_date, cvv, amount]):
            return Response({
                'status': 'error',
                'message': 'All payment details are required - Backend' 
            }, status=400)

       
        if not card_number.isdigit() or len(card_number) not in [15, 16]:
            return Response({
                'status': 'error',
                'message': 'Invalid card number'
            }, status=400)

      
        try:
            order = Order.objects.get(orderId=order_id, user=request.user)
           
           
            for orderItem in order.orderItems.all():
                

                # Create payment record
                Payment.objects.create(
                    user=request.user,
                    orderItem=orderItem,
                    paymentMethod='credit_card',
                    paymentId=f'DEMO-{order.orderId}',
                    amount=amount,
                    is_paid=True
                )

            return Response({
                'status': 'success',
                'message': 'Payment processed successfully',
               
            })

        except Order.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Order not found'
            }, status=404)

    except Exception as e:
        print(f"Payment processing error: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An error occurred while processing payment'
        }, status=500)
