# Generated by Django 5.1.4 on 2025-01-04 08:54

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0011_refund_paymentmethod_refund_transactionid'),
    ]

    operations = [
        migrations.RenameField(
            model_name='orderitem',
            old_name='courior',
            new_name='courier',
        ),
    ]
