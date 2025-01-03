from django.contrib import admin
from .models import Order, OrderItem, OrderItemStatus, Payment, ReturnRequest, ReturnRequestStatus, Refund

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('orderId', 'user', 'is_ordered', 'created_at')
    list_filter = ('is_ordered', 'created_at')
    search_fields = ('orderId', 'user__email')
    date_hierarchy = 'created_at'

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('orderItemId', 'user', 'product', 'qty', 'is_ordered', 'created_at')
    list_filter = ('is_ordered', 'created_at')
    search_fields = ('orderItemId', 'user__email', 'product__name')
    date_hierarchy = 'created_at'

@admin.register(OrderItemStatus)
class OrderItemStatusAdmin(admin.ModelAdmin):
    list_display = ('status', 'orderItem', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('orderItem__orderItemId',)
    date_hierarchy = 'created_at'

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('paymentId', 'user', 'orderItem', 'amount', 'is_paid', 'created_at')
    list_filter = ('is_paid', 'created_at', 'paymentMethod')
    search_fields = ('paymentId', 'user__email', 'orderItem__orderItemId')
    date_hierarchy = 'created_at'

@admin.register(ReturnRequest)
class ReturnRequestAdmin(admin.ModelAdmin):
    list_display = ('returnRequestId', 'user', 'orderItem', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'created_at')
    search_fields = ('returnRequestId', 'user__email', 'orderItem__orderItemId')
    date_hierarchy = 'created_at'

@admin.register(ReturnRequestStatus)
class ReturnRequestStatusAdmin(admin.ModelAdmin):
    list_display = ('status', 'returnRequest', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('returnRequest__returnRequestId',)
    date_hierarchy = 'created_at'

@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ('refundId', 'returnRequest', 'amount', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('refundId', 'returnRequest__returnRequestId')
    date_hierarchy = 'created_at'
