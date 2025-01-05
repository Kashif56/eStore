from rest_framework import serializers
from .models import Seller, SellerPayout
from orders.models import OrderItem


class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seller
        depth = 1
        fields = '__all__'


class SellerPayoutSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = SellerPayout
        depth = 1
        fields = '__all__'