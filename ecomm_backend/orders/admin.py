from django.contrib import admin

from .models import OrderItemStatus, OrderItem, Order, Payment


admin.site.register(OrderItemStatus)
admin.site.register(OrderItem)
admin.site.register(Order)
admin.site.register(Payment)

