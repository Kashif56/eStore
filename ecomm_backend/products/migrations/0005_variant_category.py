# Generated by Django 5.1.4 on 2025-01-03 10:36

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0004_merge_20250103_1536'),
    ]

    operations = [
        migrations.AddField(
            model_name='variant',
            name='category',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='products.category'),
        ),
    ]