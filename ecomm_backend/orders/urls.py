from django.urls import path
from . import views

urlpatterns = [
    path('cart/', views.cartView, name='cart'),
    path('cart/add/<productId>/', views.addToCart, name='add-to-cart'),
    path('cart/update/<orderItemId>/', views.updateOrderQty, name='update-cart-qty'),
    path('cart/remove/<orderItemId>/', views.removeFromCart, name='remove-from-cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('process-payment/', views.process_payment, name='process-payment'),
    
    
    path('orders/', views.get_user_orders, name='user-orders'),
    path('orders/<order_id>/', views.get_order_detail, name='order-detail'),
]