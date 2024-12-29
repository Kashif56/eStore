from django.urls import path

from . import views


urlpatterns = [
   path('cart/', views.cartView, name='cart'),
   path('add-to-cart/<productId>/', views.addToCart, name='addToCart'),
   path('update-order-qty/<orderItemId>/', views.updateOrderQty, name='updateOrderQty'),
   path('remove-from-cart/<orderItemId>/', views.removeFromCart, name='removeFromCart'),
]