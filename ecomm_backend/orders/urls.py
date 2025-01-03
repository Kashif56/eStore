from django.urls import path
from . import views

urlpatterns = [
    path('add-to-cart/<str:productId>/', views.addToCart, name='add-to-cart'),
    path('cart/', views.cartView, name='cart'),
    path('update-qty/<str:orderItemId>/', views.updateOrderQty, name='update-qty'),
    path('remove-from-cart/<str:orderItemId>/', views.removeFromCart, name='remove-from-cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('process-payment/', views.process_payment, name='process-payment'),
    path('user-orders/', views.get_user_orders, name='user-orders'),
    path('order-item-detail/<str:orderItem_id>/', views.get_order_detail, name='order-item-detail'),
    path('request-return/<str:orderitem_id>/', views.request_return, name='request-return'),
]
