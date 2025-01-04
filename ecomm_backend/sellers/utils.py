import random
import string

def generate_product_id():
    prefix = "pr-"
    random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    product_id = f"{prefix}{random_string}"
    
    return product_id

