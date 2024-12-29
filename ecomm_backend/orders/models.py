from django.db import models
from django.contrib.auth import get_user_model

from products.models import Product, ProductVariant

User = get_user_model()

STATUS_CHOICES = (
    ('Pending', 'Pending'),
    ('Shipped', 'Shipped'),
    ('Delivered', 'Delivered'),
    ('Cancelled', 'Cancelled'),
    ('Returned', 'Returned'),
    ('Refunded', 'Refunded'),
)

PAYMENT_METHOD_CHOICES = (
    ('stripe', 'Stripe'),
    ('cod', 'Cash On Delivery'),
)


class OrderItemStatus(models.Model):
    status = models.CharField(max_length=100, choices=STATUS_CHOICES)
    orderItem = models.ForeignKey(
        'OrderItem',
        on_delete=models.CASCADE,
        related_name='statuses'  # Changed for clarity
    )

    shipped_from = models.CharField(max_length=100)
    shipped_to = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.status


class OrderItem(models.Model):
    orderItemId = models.CharField(max_length=100, unique=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
    )
    productVariant = models.ManyToManyField(
        'products.ProductVariant',
        blank=True
    )
    qty = models.IntegerField(default=1)

    is_ordered = models.BooleanField(default=False)

    currentStatus = models.ForeignKey(
        OrderItemStatus,
        on_delete=models.CASCADE,
        related_name='current_order_items',
        null=True, blank=True
    )
    allStatus = models.ManyToManyField(
        OrderItemStatus,
        related_name='all_order_items',
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.orderItemId)
    
    def getOrderItemTotal(self):
        if self.product.discount_price is None:
            return self.product.base_price * self.qty
        else:
            return self.product.discount_price * self.qty


class Order(models.Model):
    orderId = models.CharField(max_length=100, unique=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )
    orderItems = models.ManyToManyField(
        'OrderItem',
        blank=True
    )

    is_ordered = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.orderId)


    def getOrderTotal(self):
        total = 0
        for orderItem in self.orderItems.all():
            if orderItem.product.discount_price is None:
                total += orderItem.product.base_price * orderItem.qty
            else:
                total += orderItem.product.discount_price * orderItem.qty
        return total


class Payment(models.Model):
    paymentId = models.CharField(max_length=100, unique=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )
    orderItem = models.ForeignKey(
        'OrderItem',
        on_delete=models.CASCADE,
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    paymentMethod = models.CharField(max_length=100)

    is_paid = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.paymentId)
