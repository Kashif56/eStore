from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import json
from products.models import Product, ProductVariant
from .models import Order, OrderItem
from .serializer import OrderSerializer, OrderItemSerializer
from django.db.models import F
from .utils import generate_order_id, generate_order_item_id




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addToCart(request, productId):
    try:
        print(f"Adding to cart - Product ID: {productId}")  # Debug log
        print(f"Request data: {request.data}")  # Debug log
        
        # Fetch the product
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
