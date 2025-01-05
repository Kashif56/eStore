from django.db import models

from django.conf import settings



class Seller(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    business_name = models.CharField(max_length=255)
    business_address = models.TextField()
    phone_number = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=False)

    is_approved = models.BooleanField(default=False)



    def __str__(self):
        return self.business_name