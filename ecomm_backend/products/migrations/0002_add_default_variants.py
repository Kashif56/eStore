from django.db import migrations

def add_default_variants(apps, schema_editor):
    Variant = apps.get_model('products', 'Variant')
    default_variants = ['Size', 'Color', 'Material', 'Style']
    
    for variant_name in default_variants:
        Variant.objects.get_or_create(name=variant_name)

def remove_default_variants(apps, schema_editor):
    Variant = apps.get_model('products', 'Variant')
    default_variants = ['Size', 'Color', 'Material', 'Style']
    Variant.objects.filter(name__in=default_variants).delete()

class Migration(migrations.Migration):
    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_default_variants, remove_default_variants),
    ]
