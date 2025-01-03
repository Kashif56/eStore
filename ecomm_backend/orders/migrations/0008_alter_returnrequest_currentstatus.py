# Generated by Django 5.1.4 on 2025-01-01 14:39

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0007_returnrequest_description_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='returnrequest',
            name='currentStatus',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='return_request_status', to='orders.returnrequeststatus'),
        ),
    ]