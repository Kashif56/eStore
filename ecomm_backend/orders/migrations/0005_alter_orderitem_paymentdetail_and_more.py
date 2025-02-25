# Generated by Django 5.1.4 on 2025-01-01 12:16

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0004_orderitem_paymentdetail'),
    ]

    operations = [
        migrations.AlterField(
            model_name='orderitem',
            name='paymentDetail',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='orderItemPayment', to='orders.payment'),
        ),
        migrations.AlterField(
            model_name='orderitemstatus',
            name='shipped_from',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='orderitemstatus',
            name='shipped_to',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
