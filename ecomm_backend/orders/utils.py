import random
import string
import time

from core.models import MyPayout
from sellers.models import SellerPayout

def generate_unique_id(prefix='', length=11):
    """Generate a unique ID with the given prefix and length.
    Format: PREFIX-TIMESTAMP-RANDOM
    Example: ORD-12345-ABCD
    """
    timestamp = str(int(time.time()))[-5:]  # Last 5 digits of timestamp
    # Generate random string of remaining length (minus prefix, timestamp, and separators)
    remaining_length = length - len(prefix) - len(timestamp) - 2  # -2 for separators
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=remaining_length))
    
    return f"{prefix}-{timestamp}-{random_str}"

def generate_order_id():
    """Generate a unique order ID"""
    return generate_unique_id(prefix='ORD')

def generate_order_item_id():
    """Generate a unique order item ID"""
    return generate_unique_id(prefix='ITM')

def generate_seller_payout_id():
    """Generate a unique seller payout ID"""
    return generate_unique_id(prefix='PO')



PLATFORM_FEE = 10 # 10%

def calculate_payouts(amount, platform_fee_percentage):
    # Calculate platform payout

    platform_payout = float(amount)  * (float(platform_fee_percentage) / 100)
    
    # Calculate seller payout
    seller_payout = float(amount) - float(platform_payout)
    
    return seller_payout, platform_payout

def createSellerPayout(orderItem, amount, seller):
    payoutId = generate_seller_payout_id()
    
    seller_payout, platform_payout = calculate_payouts(amount, PLATFORM_FEE)
    sellerPayout = SellerPayout.objects.create(
        payoutId=payoutId, 
        orderItem=orderItem, 
        amount=seller_payout,
        seller=seller,
        )
    return sellerPayout
    
def createMyPayout(orderItem, amount):
    payoutId = generate_seller_payout_id()
    seller_payout, platform_payout = calculate_payouts(amount, PLATFORM_FEE)
    myPayout = MyPayout.objects.create(
        payoutId=payoutId, 
        orderItem=orderItem, 
        amount=platform_payout,
        )
    return myPayout