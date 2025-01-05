from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Sum, Avg, Count, F
from django.utils import timezone
from datetime import timedelta
from orders.models import OrderItem, ReturnRequest, Refund, ReturnRequestStatus, OrderItemStatus
from orders.serializer import OrderItemSerializer, ReturnRequestSerializer
from sellers.models import Seller  # Import Seller model
from sellers.serializer import SellerSerializer
from products.models import Product, ProductAttributes, ProductReview, ProductVariant, Variant, Category, SubCategory, Images
from rest_framework import status
from products.serializer import ProductSerializer, SubCategorySerializer

from .utils import generate_product_id

import json
import os



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_seller(request):
    try:
        # Check if user already has a seller profile
        if hasattr(request.user, 'seller'):
            return Response({
                'error': 'User already has a seller profile'
            }, status=403)
        
        # Create seller profile
        seller = Seller.objects.create(
            user=request.user,
            business_name=request.data.get('business_name', ''),
            business_address=request.data.get('business_address', ''),
            phone_number=request.data.get('phone_number', '')
        )
        
        return Response({
            'status': 'success',
            'message': 'Seller profile created successfully',
            'seller': {
                'id': seller.id,
                'business_name': seller.business_name,
                'business_address': seller.business_address,
                'phone_number': seller.phone_number,
                'is_active': seller.is_active
            }
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getSellerProfile(request):
    try:
        seller = Seller.objects.get(user=request.user)
        sellerSerializer = SellerSerializer(seller)
        return Response({
            'status': 'success',
            'data': sellerSerializer.data
        })
    
    except Seller.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'User does not have a seller profile'
        }, status=404)

    except Exception as e:

        return Response({
            'error': str(e)
        }, status=500)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def addProduct(request):
    try:
        seller = request.user.seller
        print("Request data:", request.data)
        print("Files:", request.FILES)

        # Validate required fields
        required_fields = ['name', 'description', 'base_price', 'stock', 'category', 'subcategory']
        for field in required_fields:
            if not request.data.get(field):
                return Response({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Convert price and stock to appropriate types
        try:
            base_price = float(request.data.get('base_price'))
            stock = int(request.data.get('stock'))
            discount_price = float(request.data.get('discount_price')) if request.data.get('discount_price') else None
        except (ValueError, TypeError) as e:
            return Response({
                'status': 'error',
                'message': f'Invalid price or stock value: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Generate random product ID
        product_id = generate_product_id()

        # Create product
        product = Product.objects.create(
            productId=product_id,
            seller=seller,
            name=request.data.get('name'),
            description=request.data.get('description'),
            base_price=base_price,
            discount_price=discount_price,
            stock=stock,
            category_id=request.data.get('category'),
            subcategory_id=request.data.get('subcategory')
        )

        # Handle product attributes
        attributes = request.data.get('attributes')
        if attributes:
            try:
                attributes_data = json.loads(attributes)
                for attr in attributes_data:
                    if attr.get('name') and attr.get('value'):
                        ProductAttributes.objects.create(
                            product=product,
                            attribute=attr['name'],
                            value=attr['value']
                        )
            except json.JSONDecodeError as e:
                print(f"Error parsing attributes: {str(e)}")
                print(f"Attributes data: {attributes}")

        # Handle product variants
        variants = request.data.get('variants')
        if variants:
            try:
                variants_data = json.loads(variants)
                for variant_data in variants_data:
                    if variant_data.get('name') and variant_data.get('options'):
                        # Get or create variant
                        variant = Variant.objects.get_or_create(
                            name=variant_data['name']
                        )[0]
                        
                        # Create variant option
                        try:
                            price_adj = float(variant_data.get('price', 0))
                         
                        except (ValueError, TypeError):
                            price_adj = 0
                           
                        
                        # Create product variant for each option
                        for option in variant_data['options']:
                            if option:
                                ProductVariant.objects.create(
                                    product=product,
                                    variant=variant,
                                    value=option,
                                    price=price_adj,
                                 
                                )
            except json.JSONDecodeError as e:
                print(f"Error parsing variants: {str(e)}")
                print(f"Variants data: {variants}")

        # Handle images
        images = request.FILES.getlist('images')
        for image in images:
            Images.objects.create(
                product=product,
                image=image
            )

        serialized_product = ProductSerializer(product).data
        return Response({
            'status': 'success',
            'message': 'Product added successfully',
            'product': serialized_product
        })

    except Exception as e:
        import traceback
        print("Error in addProduct:")
        print(traceback.format_exc())
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def updateProduct(request, productId):
    try:
        print(f"Attempting to update product with ID: {productId}")
        seller = request.user.seller
        try:
            product = Product.objects.get(productId=productId)
            print(f"Found product: {product.name}")
        except Product.DoesNotExist:
            print(f"Product with ID {productId} not found")
            return Response({
                'status': 'error',
                'message': f'Product with ID {productId} not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Update basic product info
        product.name = request.data.get('name', product.name)
        product.description = request.data.get('description', product.description)
        try:
            if 'base_price' in request.data:
                product.base_price = float(request.data['base_price'])
            if 'stock' in request.data:
                product.stock = int(request.data['stock'])
            if 'discount_price' in request.data:
                product.discount_price = float(request.data['discount_price']) if request.data['discount_price'] else None
        except (ValueError, TypeError) as e:
            print(f"Error converting numeric fields: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Invalid numeric value provided: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        product.category_id = request.data.get('category', product.category_id)
        product.subcategory_id = request.data.get('subcategory', product.subcategory_id)
        product.save()

        # Update attributes
        attributes = request.data.get('attributes')
        if attributes:
            try:
                attributes_data = json.loads(attributes) if isinstance(attributes, str) else attributes
                # Remove existing attributes
                ProductAttributes.objects.filter(product=product).delete()
                # Add new attributes
                for attr in attributes_data:
                    if attr.get('name') and attr.get('value'):
                        ProductAttributes.objects.create(
                            product=product,
                            attribute=attr['name'],
                            value=attr['value']
                        )
            except json.JSONDecodeError as e:
                print(f"Error parsing attributes JSON: {str(e)}")
                return Response({
                    'status': 'error',
                    'message': f'Invalid attributes format: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Update variants
        variants = request.data.get('variants')
        if variants:
            try:
                variants_data = json.loads(variants) if isinstance(variants, str) else variants
                # Add new variants
                for variant_data in variants_data:
                    if variant_data.get('name') and variant_data.get('options'):
                        variant = Variant.objects.get_or_create(
                            name=variant_data['name']
                        )[0]
                        existing_variant = ProductVariant.objects.filter(product=product)
                        if existing_variant:
                            existing_variant.delete()
                        # Create variant options
                        for option in variant_data['options']:
                            if option:
                                try:
                                    price = float(variant_data.get('price', 0))
                                    ProductVariant.objects.create(
                                        product=product,
                                        variant=variant,
                                        value=option,
                                        price=price
                                    )
                                except (ValueError, TypeError) as e:
                                    print(f"Error converting variant price: {str(e)}")
                                    return Response({
                                        'status': 'error',
                                        'message': f'Invalid variant price: {str(e)}'
                                    }, status=status.HTTP_400_BAD_REQUEST)
            except json.JSONDecodeError as e:
                print(f"Error parsing variants JSON: {str(e)}")
                return Response({
                    'status': 'error',
                    'message': f'Invalid variants format: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Handle new images
        images = request.FILES.getlist('images')
        print(f"Received {len(images)} new images")
        for image in images:
            try:
                Images.objects.create(
                    product=product,
                    image=image
                )
                print(f"Created new image for product: {image.name}")
            except Exception as e:
                print(f"Error saving image {image.name}: {str(e)}")
                return Response({
                    'status': 'error',
                    'message': f'Error saving image {image.name}: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Prepare response with updated product data
        product_data = ProductSerializer(product).data
        
        # Add images to response
        images = Images.objects.filter(product=product)
        product_data['images'] = [{'id': img.id, 'url': img.image.url} for img in images]

        return Response({
            'status': 'success',
            'message': 'Product updated successfully',
            'product': product_data
        })

    except Exception as e:
        import traceback
        print(f"Unexpected error updating product {productId}:")
        print(traceback.format_exc())
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    try:
        period = request.query_params.get('period', 'monthly')
        seller = request.user.seller  # Ensure user has seller profile
        
        # Calculate date range based on period
        now = timezone.now()
        if period == 'daily':
            start_date = now - timedelta(days=1)
        elif period == 'monthly':
            start_date = now - timedelta(days=30)
        elif period == 'yearly':
            start_date = now - timedelta(days=365)
        else:  # all
            start_date = None
        
        # Base queryset
        order_items = OrderItem.objects.filter(product__seller=seller, is_ordered=True)
        if start_date:
            order_items = order_items.filter(created_at__gte=start_date)
        
        # Calculate total sales
        total_sales = sum(item.getOrderItemTotal() for item in order_items)
        total_orders = order_items.count()
        average_order = total_sales / total_orders if total_orders > 0 else 0
        
        stats = {
            'total_sales': float(total_sales),
            'total_orders': total_orders,
            'average_order': float(average_order),
        }
        
        # Calculate trends
        if start_date:
            previous_period_orders = OrderItem.objects.filter(
                product__seller=seller,
                is_ordered=True,
                created_at__lt=start_date,
                created_at__gte=start_date - timedelta(days=(now - start_date).days)
            )
        else:
            previous_period_orders = OrderItem.objects.none()
        
        previous_total_sales = sum(item.getOrderItemTotal() for item in previous_period_orders)
        previous_total_orders = previous_period_orders.count()
        previous_average_order = previous_total_sales / previous_total_orders if previous_total_orders > 0 else 0
        
        previous_stats = {
            'total_sales': float(previous_total_sales),
            'total_orders': previous_total_orders,
            'average_order': float(previous_average_order),
        }
        
        # Calculate trends as percentages
        trends = {
            'sales_trend': calculate_trend(stats['total_sales'], previous_stats['total_sales']),
            'orders_trend': calculate_trend(stats['total_orders'], previous_stats['total_orders']),
            'average_trend': calculate_trend(stats['average_order'], previous_stats['average_order']),
        }
        
        return Response({
            'stats': stats,
            'trends': trends,
            'period': period
        })
    except AttributeError:
        return Response(
            {'error': 'User does not have a seller profile'},
            status=403
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=500
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sales_graph_data(request):
    try:
        period = request.query_params.get('period', 'monthly')
        seller = request.user.seller  # Ensure user has seller profile
        
        now = timezone.now()
        
        if period == 'daily':
            days = 7
            date_format = '%Y-%m-%d'
        elif period == 'monthly':
            days = 30
            date_format = '%Y-%m'
        elif period == 'yearly':
            days = 365
            date_format = '%Y'
        else:  # all
            days = 365
            date_format = '%Y-%m'
        
        # Get all order items for the period
        order_items = OrderItem.objects.filter(
            product__seller=seller,
            is_ordered=True,
            created_at__gte=now - timedelta(days=days)
        ).order_by('created_at')
        
        # Group by date and calculate sales
        sales_data = {}
        for item in order_items:
            date_key = item.created_at.strftime(date_format)
            if date_key not in sales_data:
                sales_data[date_key] = 0
            sales_data[date_key] += float(item.getOrderItemTotal())
        
        # Convert to list format
        formatted_data = [
            {'date': date, 'sales': sales}
            for date, sales in sorted(sales_data.items())
        ]
        
        return Response(formatted_data)
    except AttributeError:
        return Response(
            {'error': 'User does not have a seller profile'},
            status=403
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=500
        )

def calculate_trend(current, previous):
    if not previous:
        return 0
    return ((current - previous) / previous) * 100

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_top_products(request):
    try:
        seller = request.user.seller
        
        top_products = Product.objects.filter(seller=seller).order_by('-sold')
        serializer = ProductSerializer(top_products, many=True)
        
        return Response(serializer.data)
    except Seller.DoesNotExist:
        return Response(
            {'error': 'User does not have a seller profile'},
            status=status.HTTP_403_FORBIDDEN
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sellerProducts(request):
    try:
        seller = request.user.seller
        products = Product.objects.filter(seller=seller)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    except Seller.DoesNotExist:
        return Response(
            {'error': 'User does not have a seller profile'},
            status=status.HTTP_403_FORBIDDEN
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sellerCategories(request):
    try:
        categories = Category.objects.all()
        return Response([{
            'id': category.id,
            'name': category.name,
            'subcategories': [{
                'id': sub.id,
                'name': sub.name
            } for sub in category.subcategories.all()]
        } for category in categories])
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_subcategories(request, categoryId):
    try:
        category = Category.objects.get(id=categoryId)
        subcategories = SubCategory.objects.filter(category=category)
        serializer = SubCategorySerializer(subcategories, many=True)
        return Response({
            'status': 'success',
            'subcategories': serializer.data
        })
    except Category.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Category not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print("Error in get_subcategories:", str(e))
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteProduct(request, productId):
    try:
        seller = request.user.seller
        product = Product.objects.get(productId=productId, seller=seller)
        product.delete()
        return Response({'message': 'Product deleted successfully'})
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found or you do not have permission'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_variants(request):
    try:
        category_id = request.GET.get('category')
        if not category_id:
            return Response({
                'status': 'error',
                'message': 'Category ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        variants = Variant.objects.filter(category_id=category_id)
        variant_list = [{'id': v.id, 'name': v.name} for v in variants]
        return Response({
            'status': 'success',
            'variants': variant_list,
            'hasVariants': len(variant_list) > 0
        })
    except Exception as e:
        import traceback
        print("Error in get_variants:")
        print(traceback.format_exc())
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_product_for_edit(request, productId):
    try:
        print(f"Fetching product {productId} for edit...")
        seller = request.user.seller
        product = Product.objects.get(productId=productId, seller=seller)
        
        print("Found product, getting attributes...")
        # Get product attributes
        attributes = ProductAttributes.objects.filter(product=product)
        attributes_list = [{'name': attr.attribute, 'value': attr.value} for attr in attributes]
        
        print("Getting variants...")
        # Get product variants
        product_variants = ProductVariant.objects.filter(product=product)
        variants_list = []
        for pv in product_variants:
            variant_data = {
                'name': pv.variant.name,
                'options': [pv.value],
                'price': float(pv.price) if pv.price else 0,
            }
            # Check if this variant is already in the list
            existing_variant = next((v for v in variants_list if v['name'] == pv.variant.name), None)
            if existing_variant:
                existing_variant['options'].append(pv.value)
            else:
                variants_list.append(variant_data)
        
        print("Getting images...")
        # Get product images
        images = Images.objects.filter(product=product)
        images_list = [{'id': img.id, 'url': img.image.url} for img in images]
        
        print("Preparing response data...")
        response_data = {
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'base_price': float(product.base_price),
            'discount_price': float(product.discount_price) if product.discount_price else None,
            'stock': product.stock,
            'category': product.category.id if product.category else None,
            'subcategory': product.subcategory.id if product.subcategory else None,
            'attributes': attributes_list,
            'variants': variants_list,
            'images': images_list
        }
        
        print("Sending response...")
        return Response({
            'status': 'success',
            'product': response_data
        })
    except Product.DoesNotExist:
        print(f"Product {productId} not found for seller {request.user.seller.id}")
        return Response({
            'status': 'error',
            'message': 'Product not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        print("Error in get_product_for_edit:")
        print(traceback.format_exc())
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product_image(request, productId, imageId):
    try:
        seller = request.user.seller
        product = Product.objects.get(productId=productId, seller=seller)
        image = Images.objects.get(id=imageId, product=product)
        
        # Delete the actual file
        if image.image:
            if os.path.isfile(image.image.path):
                os.remove(image.image.path)
        
        # Delete the database record
        image.delete()
        
        return Response({
            'status': 'success',
            'message': 'Image deleted successfully'
        })
    except Product.DoesNotExist:
        return Response({
            'status': 'error',
            'message': f'Product with ID {productId} not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Images.DoesNotExist:
        return Response({
            'status': 'error',
            'message': f'Image with ID {imageId} not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        print(f"Error in delete_product_image for product {productId}, image {imageId}:")
        print(traceback.format_exc())
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_orders(request):
    try:
        seller = request.user.seller
        print(f"Fetching orders for seller: {seller.id}")  # Debug log
        
        order_items = OrderItem.objects.filter(
            product__seller=seller
        ).select_related(
            'product',
            'user',
            'currentStatus'
        ).prefetch_related(
            'product__images',
            'allStatus'
        ).order_by('-created_at')
        
        print(f"Found {order_items.count()} order items")  # Debug log
        
        orders_data = []
        for item in order_items:
            try:
                orders_data.append({
                    'id': item.id,
                    'orderItemId': item.orderItemId,
                    'created_at': item.created_at,
                    'qty': item.qty,
                    'product': {
                        'id': item.product.id,
                        'name': item.product.name,
                        'base_price': float(item.product.base_price),
                        'images': [{'image': img.image.url} for img in item.product.images.all()[:1]] if item.product.images.exists() else []
                    },
                    'user': {
                        'id': item.user.id,
                        'name': f"{item.user.first_name} {item.user.last_name}",
                        'email': item.user.email
                    },
                    'currentStatus': {
                        'status': item.currentStatus.status if item.currentStatus else 'Pending',
                        'updated_at': item.currentStatus.created_at if item.currentStatus else item.created_at
                    }
                })
            except Exception as item_error:
                print(f"Error processing order item {item.id}: {str(item_error)}")  # Debug log
                continue

        return Response({
            'status': 'success',
            'data': orders_data
        })
    except Exception as e:
        print(f"Error in seller_orders: {str(e)}")  # Debug log
        import traceback
        print(traceback.format_exc())  # Print full traceback
        return Response({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_order_status(request, orderItemId):
    try:
        seller = request.user.seller
        new_status = request.data.get('status')
        shipping_details = request.data.get('shippingDetails')

        # Validate the status transition
        valid_transitions = {
            'Pending': ['Processing', 'Processed', 'Shipped', 'Delivered'],
            'Processing': ['Processed', 'Shipped', 'Delivered'],
            'Processed': ['Shipped', 'Delivered'],
            'Shipped': ['Delivered'],
        }

        order_item = OrderItem.objects.get(
            orderItemId=orderItemId,
            product__seller=seller
        )

        current_status = order_item.currentStatus.status if order_item.currentStatus else 'Pending'

        if new_status not in valid_transitions.get(current_status, []):
            return Response({
                'status': 'error',
                'message': f'Invalid status transition from {current_status} to {new_status}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate shipping details if status is Shipped
        if new_status == 'Shipped':
            if not shipping_details or not all(shipping_details.values()):
                return Response({
                    'status': 'error',
                    'message': 'Shipping details are required for Shipped status'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Create new status
        new_status_obj = OrderItemStatus.objects.create(
            orderItem=order_item,
            status=new_status,
            shipped_from=shipping_details.get('shippedFrom') if shipping_details else None,
            shipped_to=shipping_details.get('shippedTo') if shipping_details else None
        )

        # Update current status
        order_item.currentStatus = new_status_obj
        order_item.courier = shipping_details.get('courier') if shipping_details else None
        order_item.trackingId = shipping_details.get('trackingId') if shipping_details else None
        order_item.save()

        # Add to all statuses
        order_item.allStatus.add(new_status_obj)

        return Response({
            'status': 'success',
            'message': f'Order status updated to {new_status}'
        })

    except OrderItem.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Order not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error in update_order_status: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_return_request_status(request, orderItemId):
    try:
        seller = request.user.seller
        new_status = request.data.get('status')

        # Validate the status transition
        valid_statuses = ['Approved', 'Rejected', 'Cancelled', 'Returned']

        if new_status not in valid_statuses:
            return Response({
                'status': 'error',
                'message': f'Invalid status: {new_status}'
            }, status=status.HTTP_400_BAD_REQUEST)

        order_item = OrderItem.objects.get(
            orderItemId=orderItemId,
            product__seller=seller
        )

        return_request = ReturnRequest.objects.get(orderItem=order_item)

        # Create new return request status
        new_status_obj = ReturnRequestStatus.objects.create(
            returnRequest=return_request,
            status=new_status,
            reason=request.data.get('reason', None)
        )

        if new_status == 'Approved':
            orderItem_status = 'Return Approved'
        elif new_status == 'Rejected':
            orderItem_status = 'Return Rejected'
        elif new_status == 'Cancelled':
            orderItem_status = 'Cancelled'
        elif new_status == 'Returned':
            orderItem_status = 'Returned'

        newOrderItemStatus = OrderItemStatus.objects.create(
            orderItem=order_item,
            status=orderItem_status,
        )

        # Update current status
        order_item.currentStatus = newOrderItemStatus
        order_item.save()

        # Add to all statuses
        order_item.allStatus.add(newOrderItemStatus)

        # Update current status
        return_request.currentStatus = new_status_obj
        if new_status == 'Approved':
            return_request.is_approved = True
        return_request.save()

        # Add to all statuses
        return_request.allStatus.add(new_status_obj)

        return Response({
            'status': 'success',
            'message': f'Return request status updated to {new_status}'
        })

    except (OrderItem.DoesNotExist, ReturnRequest.DoesNotExist):
        return Response({
            'status': 'error',
            'message': 'Order or return request not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error in update_return_request_status: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_item_detail(request, orderItemId):
    try:
        seller = request.user.seller

        sellerOrderItem = OrderItem.objects.get(orderItemId=orderItemId, product__seller=seller) 

        returnRequestObj = ReturnRequest.objects.filter(orderItem=sellerOrderItem)
        if returnRequestObj.exists():
            returnRequestObj = returnRequestObj.first()
            returnRequestdata = ReturnRequestSerializer(returnRequestObj)
        else:
            returnRequestdata = None
        
            
        
        data = OrderItemSerializer(sellerOrderItem)
        
        return Response({
            'status': 'success',
            'data': data.data,
            'returnRequest': returnRequestdata.data if returnRequestdata else None,
            'isReturnRequest': True if returnRequestObj.exists() else False
        })
        
    except (OrderItem.DoesNotExist):
        return Response({
            'status': 'error',
            'message': 'Order item not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        print(f"Error in get_order_item_detail: {str(e)}")  # Debug log
        import traceback
        print(traceback.format_exc())  # Print full traceback
        return Response({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_refund(request, order_item_id):
    try:
        order_item = OrderItem.objects.get(orderItemId=order_item_id)
        return_request = ReturnRequest.objects.get(orderItem=order_item)

        # Create refund record
        Refund.objects.create(
            returnRequest=return_request,
            amount=request.data.get('amount'),
            paymentMethod=request.data.get('paymentMethod'),
            transactionId=request.data.get('transactionId')
        )

        # Create new return request status
        new_status_obj = ReturnRequestStatus.objects.create(
            returnRequest=return_request,
            status='Refunded'
        )

        # Update return request status
        return_request.currentStatus = new_status_obj
        return_request.save()

        return_request.allStatus.add(new_status_obj)

        # Create new order item status
        new_order_status = OrderItemStatus.objects.create(
            orderItem=order_item,
            status='Refunded'
        )

        # Update order item status
        order_item.currentStatus = new_order_status
        order_item.save()

        # Add to all statuses
        order_item.allStatus.add(new_order_status)

        return Response({
            'status': 'success',
            'message': 'Refund processed successfully'
        })

    except (OrderItem.DoesNotExist, ReturnRequest.DoesNotExist) as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=404)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)