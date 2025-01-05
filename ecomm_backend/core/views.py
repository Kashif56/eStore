from rest_framework.response import Response
from rest_framework.decorators import api_view

from sellers.models import Seller
from sellers.serializer import SellerSerializer
from orders.models import OrderItem


@api_view(['GET'])
def getUserCartCount(request,username):
    print(username)
    orderItems = OrderItem.objects.filter(user__username=username, is_ordered=False)
    count = orderItems.count()
    print(count)
    return Response({
        'status': 'success',
        'count': count
        }
        )


@api_view(['GET'])
def checkUserSellerStatus(request):
    try:
        seller = Seller.objects.get(user=request.user)

        return Response({
            'status': 'success',
            'isSeller': True,
            'isApproved': seller.is_approved,
            'data': SellerSerializer(seller).data
        })
    
    except Seller.DoesNotExist:
        return Response({
            'status': 'success',
            'isSeller': False,
            'isApproved': False
        }, status=404)
    
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)

