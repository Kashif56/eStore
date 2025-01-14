from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import json
from products.models import Product, ProductVariant
from .models import Order, OrderItem, Payment, OrderItemStatus, ReturnRequest, ReturnRequestStatus
from .serializer import OrderSerializer, OrderItemSerializer, PaymentSerializer
from django.db.models import F, Sum
from .utils import generate_order_id, generate_order_item_id, generate_seller_payout_id, createSellerPayout, createMyPayout
from accounts.models import Address
from django.shortcuts import get_object_or_404
from django.conf import settings
import uuid


from sellers.models import Seller, SellerPayout
from sellers.serializer import SellerPayoutSerializer

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
                status='Pending',
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
                    paymentId=f"PAY_{item.orderItemId}",
                    user=request.user,
                    orderItem=item, 
                    amount=item.getOrderItemTotal(),
                    paymentMethod='cod',
                  
                )

                # Creating Seller Payout
                seller = item.product.seller
                createSellerPayout(item, item.getOrderItemTotal(), seller)

                # Creating My Payout
                createMyPayout(item, item.getOrderItemTotal())

                item.paymentDetail = payment
                item.save()

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
                newPayment =Payment.objects.create(
                    user=request.user,
                    orderItem=orderItem,
                    paymentMethod='Credit/Debit Card',
                    paymentId=f'PAY_{orderItem.orderItemId}',
                    amount=amount,
                    is_paid=True
                )

                # Creating Seller Payout
                seller = orderItem.product.seller
                createSellerPayout(orderItem, amount, seller)

                # Creating My Payout
                createMyPayout(orderItem, amount)

                orderItem.paymentDetail = newPayment
                orderItem.save()

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




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_orders(request):
    try:
        orderItems = OrderItem.objects.filter(user=request.user, is_ordered=True).order_by('-created_at')
        orderItemSerializer = OrderItemSerializer(orderItems, many=True)


      
        return Response({
            'status': 'success',
            'data': orderItemSerializer.data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_detail(request, orderItem_id):
    try:
        print(f"Fetching order item: {orderItem_id}")
        order_item = OrderItem.objects.get(orderItemId=orderItem_id)
        paymentObj = Payment.objects.get(orderItem=order_item)
        paymentObjSerializer = PaymentSerializer(paymentObj)
        serializer = OrderItemSerializer(order_item)

        returnRequest = ReturnRequest.objects.filter(orderItem=order_item)
        if returnRequest.exists():
            returnRequest = returnRequest.first()
            returnRequestSerializer = ReturnRequestSerializer(returnRequest)
        else:
            returnRequestSerializer = None
      
        return Response({
            'status': 'success',
            'data': serializer.data,
            'payment': paymentObjSerializer.data,
            'returnRequest': returnRequestSerializer.data if returnRequestSerializer else None
        })
    except OrderItem.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Order item not found'
        }, status=404)
    except Exception as e:
        print(f"Error in get_order_detail: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An unexpected error occurred.',
            'details': str(e)
        }, status=500)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_return(request, orderitem_id):
    try:
        order_item = OrderItem.objects.get(orderItemId=orderitem_id, user=request.user)
        
        # Check if the order item is delivered
        if not order_item.currentStatus or order_item.currentStatus.status != 'Delivered':
            return Response({
                'status': 'error',
                'message': 'Return can only be requested for delivered items'
            }, status=400)
            
        # Check if return request already exists
        if ReturnRequest.objects.filter(orderItem=order_item).exists():
            return Response({
                'status': 'error',
                'message': 'Return request already exists for this order item'
            }, status=400)
            
        # Generate unique return request ID
        return_request_id = f"RET-{uuid.uuid4().hex[:8].upper()}"
        
        # Create return request
        return_request = ReturnRequest.objects.create(
            returnRequestId=return_request_id,
            orderItem=order_item,
            user=request.user,
            reason=request.data.get('reason'),
            description=request.data.get('description')
        )
        
        # Create initial return request status
        return_request_status = ReturnRequestStatus.objects.create(
            returnRequest=return_request,
            status='Pending'
        )

        # Update order item status to Return Requested
        orderItemStatus = OrderItemStatus.objects.create(
            orderItem=order_item,
            status='Return Requested',
        )

        order_item.currentStatus = orderItemStatus
        order_item.allStatus.add(orderItemStatus)
        order_item.save()

        return_request.currentStatus = return_request_status
        return_request.allStatus.add(return_request_status)
        return_request.save()

        return Response({
            'status': 'success',
            'message': 'Return request created successfully',  
        })
        
    except OrderItem.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Order item not found'
        }, status=404)
    except Exception as e:
        print(f"Error in request_return: {str(e)}")  # Add debug logging
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)
