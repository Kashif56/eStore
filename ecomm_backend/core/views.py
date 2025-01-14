from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from sellers.models import Seller
from sellers.serializer import SellerSerializer
from orders.models import OrderItem
from django.db.models import Sum, Count
from sellers.models import SellerPayout
from sellers.serializer import SellerPayoutSerializer
from .models import MyPayout


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_seller_payout_stats(request):
    """
    Get seller's payout statistics including pending and paid amounts
    """
    try:
        seller = request.user.seller

        # Get total pending payouts
        pending_payouts = SellerPayout.objects.filter(
            seller=seller,
            is_paid=False,
            isRefunded=False,
            orderItem__paymentDetail__is_paid=True)

        pendingTotal = sum(payout.amount for payout in pending_payouts)

        # Get total paid payouts
        paid_payouts = SellerPayout.objects.filter(
            seller=seller,
            is_paid=True,
            isRefunded=False,
            orderItem__paymentDetail__is_paid=True)

        paidTotal = sum(payout.amount for payout in paid_payouts)

        return Response({
            'status': 'success',
            'data': {
                'pendingTotal': float(pendingTotal),
                'paidTotal': float(paidTotal),
                'pendingCount': pending_payouts.count(),
                'paidCount': paid_payouts.count()
            }
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sellerPayouts(request):
    try:
        payouts = SellerPayout.objects.filter(seller=request.user.seller, isRefunded=False, orderItem__paymentDetail__is_paid=True)
        serializer = SellerPayoutSerializer(payouts, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)