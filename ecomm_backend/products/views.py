from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from .models import Product, ProductAttributes, Variant, ProductVariant, Category, SubCategory, Images, ProductReview
from .serializer import ProductSerializer, ProductAttributesSerializer, VariantSerializer, ProductVariantSerializer, CategorySerializer, SubCategorySerializer, ImagesSerializer, ProductReviewSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def allProducts(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

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
        serializer = ProductSerializer(obj)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
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