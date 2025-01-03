from django.urls import path

from . import views


urlpatterns = [
    # Endpoints for Dashboard Stats
    path('dashboard/stats/', views.get_dashboard_stats, name='dashboard-stats'),
    path('dashboard/sales-graph/', views.get_sales_graph_data, name='sales-graph'),
    path('dashboard/top-products/', views.get_top_products, name='top-products'),
    path('register/', views.register_seller, name='register-seller'),
    
    # Endpoints for Product Management
    path('products/', views.sellerProducts, name='seller-products'),
    path('products/add/', views.addProduct, name='add-product'),
    path('products/<productId>/update/', views.updateProduct, name='update-product'),
    path('products/<productId>/delete/', views.deleteProduct, name='delete-product'),
    path('product/<productId>/edit/', views.get_product_for_edit, name='get-product-for-edit'),
    path('products/<productId>/images/<imageId>/', views.delete_product_image, name='delete-product-image'),


    # Endpoints for Utils 
    path('variants/', views.get_variants, name='get-variants'),
    path('categories/', views.sellerCategories, name='seller-categories'),
    path('categories/<categoryId>/subcategories/', views.get_subcategories, name='get_subcategories'),


    # Endpoints for Orders
    path('orders/', views.sellerOrders, name='sellerOrders'),
    path('seller-orders/', views.sellerOrders, name='sellerOrders'),
    
]