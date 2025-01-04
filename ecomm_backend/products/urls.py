from django.urls import path
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated

from . import views

urlpatterns = [
    # Public endpoints
    path('list/', views.allProducts, name='allProducts'),
    path('product-detail/<productId>/', views.productDetail, name='productDetail'),
    path('categories/', views.getCategories, name='getCategories'),
    path('variants/', views.getVariantOptions, name='getVariantOptions'),

    path('get-all-reviews/<productId>/', views.getAllReviews, name='getAllReviews'),
    path('add-review/<productId>/', views.addProductReview, name='addProductReview'),
    path('variants/', views.get_variants, name='get-variants'),
]