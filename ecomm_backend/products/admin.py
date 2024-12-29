from django.contrib import admin
from .models import (
    Product,
    ProductAttributes,
    Category,
    SubCategory,
    Images,
    Variant,
    ProductVariant,
    ProductReview
)


# Inline for Product Attributes
class ProductAttributesInline(admin.TabularInline):
    model = ProductAttributes
    extra = 1
    fields = ['attribute', 'value']


# Inline for Product Variants
class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['variant', 'value', 'price']


# Inline for Images
class ImagesInline(admin.TabularInline):
    model = Images
    extra = 1
    fields = ['image']


# Inline for SubCategories in Category
class SubCategoryInline(admin.TabularInline):
    model = SubCategory
    extra = 1
    fields = ['name', 'slug']


# Product Admin
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'productId', 'base_price', 'discount_price', 'stock', 'sold', 'is_active']
    list_filter = ['is_active', 'category', 'subcategory']
    search_fields = ['name', 'productId', 'description']
    inlines = [ImagesInline, ProductAttributesInline, ProductVariantInline]
    exclude = ['created_at', 'updated_at']


# Category Admin
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [SubCategoryInline]


# SubCategory Admin
@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'category']
    list_filter = ['category']
    prepopulated_fields = {'slug': ('name',)}


# Variant Admin
@admin.register(Variant)
class VariantAdmin(admin.ModelAdmin):
    list_display = ['name']


# Product Review Admin
@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['product__name', 'user__username', 'comment']
    readonly_fields = ['created_at', 'updated_at']
