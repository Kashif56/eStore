# Generated by Django 5.1.4 on 2024-12-29 11:31

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('orders', '0001_initial'),
        ('products', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='orderitem',
            name='product',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='products.product'),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='productVariant',
            field=models.ManyToManyField(blank=True, to='products.productvariant'),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='order',
            name='orderItems',
            field=models.ManyToManyField(blank=True, to='orders.orderitem'),
        ),
        migrations.AddField(
            model_name='orderitemstatus',
            name='orderItem',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='statuses', to='orders.orderitem'),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='allStatus',
            field=models.ManyToManyField(blank=True, related_name='all_order_items', to='orders.orderitemstatus'),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='currentStatus',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='current_order_items', to='orders.orderitemstatus'),
        ),
        migrations.AddField(
            model_name='payment',
            name='orderItem',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='orders.orderitem'),
        ),
        migrations.AddField(
            model_name='payment',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]