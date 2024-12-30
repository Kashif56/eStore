# Generated by Django 5.1.4 on 2024-12-29 16:03

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_customuser_updated_at'),
        ('orders', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderitem',
            name='shipping_address',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='accounts.address'),
        ),
    ]
