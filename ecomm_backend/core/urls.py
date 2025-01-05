from django.urls import path

from . import views


urlpatterns = [
  path('get-user-cart-count/<username>/', views.getUserCartCount),

  path('get-user-seller-status/', views.checkUserSellerStatus),
]