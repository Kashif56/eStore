from django.urls import path

from . import views


urlpatterns = [
    # Endpoints for Dashboard Stats
    path('dashboard/stats/', views.get_dashboard_stats, name='dashboard-stats'),
    path('dashboard/sales-graph/', views.get_sales_graph_data, name='sales-graph'),
    path('dashboard/top-products/', views.get_top_products, name='top-products'),
    path('register/', views.register_seller, name='register-seller'),
    path('profile/', views.getSellerProfile, name='get-seller-profile'),
    
    # Endpoints for Product Management
    path('products/', views.sellerProducts, name='seller-products'),
    path('products/add/', views.addProduct, name='add-product'),
    path('products/<productId>/update/', views.updateProduct, name='update-product'),
    path('products/<productId>/delete/', views.deleteProduct, name='delete-product'),
    path('products/<productId>/edit/', views.get_product_for_edit, name='get-product-for-edit'),
    path('products/<productId>/images/<imageId>/delete/', views.delete_product_image, name='delete-product-image'),


    # Endpoints for Utils 
    path('variants/', views.get_variants, name='get-variants'),
    path('categories/', views.sellerCategories, name='seller-categories'),
    path('categories/<categoryId>/subcategories/', views.get_subcategories, name='get_subcategories'),


    # Endpoints for Orders
    path('orders/', views.seller_orders, name='seller-orders'),
    path('orders/update-status/<orderItemId>/', views.update_order_status, name='update-order-status'),
    path('orders/order-item-detail/<orderItemId>/', views.get_order_item_detail, name='get-order-item-detail'),
    


    # Endpoints for Returns
    path('returns/update-return-status/<orderItemId>/', views.update_return_request_status, name='update-return-request-status'),

    path('process-refund/<order_item_id>/', views.process_refund, name='process_refund'),
]