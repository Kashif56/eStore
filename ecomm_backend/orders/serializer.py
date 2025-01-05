from rest_framework import serializers
from .models import Order, OrderItem, OrderItemStatus, Payment, ReturnRequest, ReturnRequestStatus, Refund
from products.models import Product, ProductVariant
from sellers.serializer import SellerSerializer





class OrderItemStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItemStatus
        fields = '__all__'


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'seller', 'productId', 'description', 'base_price', 'discount_price', 
                 'stock', 'sold', 'is_active', 'images']
        depth = 1  # This will serialize the related images automatically


class ReturnRequestStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturnRequestStatus
        fields = '__all__'


class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = '__all__'





class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    productVariant = ProductVariantSerializer(many=True, read_only=True)
    currentStatus = OrderItemStatusSerializer(read_only=True)
    allStatus = OrderItemStatusSerializer(many=True, read_only=True)
    paymentDetail = PaymentSerializer(read_only=True)
    variantDetails = serializers.SerializerMethodField()

    orderItemTotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = '__all__'
        depth = 1

    def get_variantDetails(self, obj):
        variants = obj.productVariant.all()
        return [
            {
                'id': variant.id,
                'name': variant.variant.name,
                'value': variant.value,
               
            }
            for variant in variants
        ]

    def get_orderItemTotal(self, obj):
        return obj.getOrderItemTotal()

class OrderSerializer(serializers.ModelSerializer):
    orderItems = OrderItemSerializer(many=True, read_only=True)
    orderTotal = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'
        depth = 1

    def get_orderTotal(self, obj):
        if obj:
            return obj.getOrderTotal()
        return 0


class ReturnRequestSerializer(serializers.ModelSerializer):
    currentStatus = ReturnRequestStatusSerializer(read_only=True)
    allStatus = ReturnRequestStatusSerializer(many=True, read_only=True)
    orderItem = OrderItemSerializer(read_only=True)

    class Meta:
        model = ReturnRequest
        fields = '__all__'