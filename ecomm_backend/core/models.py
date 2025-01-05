from django.db import models


class MyPayout(models.Model):
    payoutId = models.CharField(max_length=20, unique=True)
    orderItem = models.ForeignKey('orders.OrderItem', on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.payoutId
