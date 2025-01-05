from rest_framework import serializers
from .models import Product, ProductAttributes, Category, SubCategory, Images, Variant, ProductVariant, ProductReview

from sellers.serializer import SellerSerializer
from django.db import models


# Serializer for ProductAttributes
class ProductAttributesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAttributes
        
        fields = ['id', 'product', 'attribute', 'value']


# Serializer for ProductVariant
class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        depth = 1
        fields = ['id', 'product', 'variant', 'value', 'price']


# Serializer for Images
class ImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Images
       
        fields = ['id', 'image']


# Serializer for Variant
class VariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variant
       
        fields = ['id', 'name', 'category']


# Serializer for SubCategory
class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
       
        model = SubCategory
        fields = ['id', 'name', 'slug', 'category']


# Serializer for Category
class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)  # Nested SubCategories

    class Meta:
       
        model = Category
        fields = ['id', 'name', 'slug', 'subcategories']


# Serializer for Product
class ProductSerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)
    images = ImagesSerializer(many=True, read_only=True)  # Nested Images
    attributes = ProductAttributesSerializer(many=True, read_only=True)  # Nested ProductAttributes
    variants = ProductVariantSerializer(many=True, read_only=True)  # Nested ProductVariants
    category = CategorySerializer(read_only=True)  # Nested Category
    subcategory = SubCategorySerializer(read_only=True)  # Nested SubCategory
    rating = serializers.FloatField(source='reviews.rating', read_only=True)
    review_count = serializers.IntegerField(source='reviews.count', read_only=True)

    class Meta:
        model = Product
        depth = 1
       
        fields = [
            'id', 'name','seller','productId', 'description', 'base_price', 'discount_price', 
            'stock', 'sold', 'is_active', 'created_at', 'updated_at', 
            'images', 'attributes', 'variants', 'category', 'subcategory',
            'rating', 'review_count'
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        reviews = instance.reviews.all()
        representation['review_count'] = reviews.count()
        representation['rating'] = reviews.aggregate(avg_rating=models.Avg('rating'))['avg_rating'] or 0
        return representation


class ProductReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductReview
        depth = 1
        fields = ['id', 'product', 'user', 'orderItem', 'rating', 'comment', 'created_at', 'updated_at']