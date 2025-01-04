from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.db.models import Count, Q

from .models import Product, ProductAttributes, Variant, ProductVariant, Category, SubCategory, Images, ProductReview
from .serializer import ProductSerializer, ProductAttributesSerializer, VariantSerializer, ProductVariantSerializer, CategorySerializer, SubCategorySerializer, ImagesSerializer, ProductReviewSerializer
from orders.models import OrderItem


@api_view(['GET'])
@permission_classes([AllowAny])
def allProducts(request):
    try:
        # Get query parameters
        search_query = request.GET.get('search', '').strip()
        categories = request.GET.get('categories', '')
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        sort_by = request.GET.get('sort', 'newest')
        variants = request.GET.get('variants', '')  # Format: "color:red,blue;size:M,L"

        # Start with all products
        products = Product.objects.select_related('category').prefetch_related(
            'images', 'variants', 'variants__variant'
        ).all()

        # Apply search filter
        if search_query:
            products = products.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(category__name__icontains=search_query)
            )

        # Apply category filter
        if categories:
            try:
                category_ids = [int(id) for id in categories.split(',')]
                products = products.filter(category__id__in=category_ids)
            except ValueError:
                return Response({
                    'status': 'error',
                    'message': 'Invalid category ID format'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Apply variant filters
        if variants:
            try:
                variant_filters = {}
                for variant_filter in variants.split(';'):
                    if ':' in variant_filter:
                        name, values = variant_filter.split(':')
                        if values:  # Only add if values are present
                            variant_filters[name] = values.split(',')
                
                variant_q = Q()
                for variant_name, variant_values in variant_filters.items():
                    if variant_values:  # Only add to query if values exist
                        variant_q |= Q(
                            variants__variant__name__iexact=variant_name,
                            variants__value__in=variant_values
                        )
                
                if variant_filters and variant_q:  # Only apply filter if we have valid conditions
                    products = products.filter(variant_q).distinct()
            except Exception as e:
                print(f"Error processing variant filters: {str(e)}")
                return Response({
                    'status': 'error',
                    'message': 'Invalid variant filter format'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Apply price range filter
        try:
            if min_price:
                products = products.filter(base_price__gte=float(min_price))
            if max_price:
                products = products.filter(base_price__lte=float(max_price))
        except ValueError:
            return Response({
                'status': 'error',
                'message': 'Invalid price format'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Apply sorting
        if sort_by == 'price_low':
            products = products.order_by('base_price')
        elif sort_by == 'price_high':
            products = products.order_by('-base_price')
        elif sort_by == 'popular':
            products = products.order_by('-sold')
        else:  # newest
            products = products.order_by('-created_at')

        serializer = ProductSerializer(products, many=True)
        return Response({
            'status': 'success',
            'count': products.count(),
            'data': serializer.data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def getVariantOptions(request):
    try:
        # Get all unique variant types and their values
        variants = Variant.objects.all().values('name').distinct()
        variant_options = {}
        
        for variant in variants:
            values = ProductVariant.objects.filter(
                variant__name=variant['name']
            ).values_list('value', flat=True).distinct()
            variant_options[variant['name']] = list(values)
        
        return Response({
            'status': 'success',
            'data': variant_options
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def productDetail(request, productId):
    try:
        obj = Product.objects.get(productId=productId)
        serializer = ProductSerializer(obj)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
    except Exception as e:
        print(f"An error occurred: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addProductReview(request, productId):
    try:
        productObj = Product.objects.get(productId=productId)

        rating = request.data.get('rating')
        comment = request.data.get('comment')

      

        review = ProductReview.objects.create(product=productObj, rating=rating, comment=comment, user=request.user)

        serializer = ProductReviewSerializer(review)

        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def getAllReviews(request, productId):
    try:
        obj = Product.objects.get(productId=productId)
        reviews = ProductReview.objects.filter(product=obj)
        serializer = ProductReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def getCategories(request):
    try:
        categories = Category.objects.annotate(
            count=Count('product', distinct=True)
        ).values('id', 'name', 'count')
        
        return Response({
            'status': 'success',
            'data': list(categories)
        })
    except Exception as e:
        print(f"Error in getCategories: {str(e)}")  # Debug log
        return Response({
            'status': 'error',
            'message': 'Failed to fetch categories'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
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
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_user_ordered_product(request, productId):
    try:
        product = Product.objects.get(productId=productId)
        has_ordered = OrderItem.objects.filter(
            user=request.user,
            product=product,
            is_ordered=True
        ).exists()

        # Checks If orderItem status is delivered from AllStatus field
        if has_ordered:
            has_ordered = OrderItem.objects.filter(
                user=request.user,
                product=product,
                is_ordered=True,
                currentStatus__status='Delivered'
            ).exists()

        return Response({
            'status': 'success',
            'hasOrdered': has_ordered
        })
    except Product.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Product not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)