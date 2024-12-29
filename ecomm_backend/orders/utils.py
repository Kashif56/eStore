import random
import string
import time

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
