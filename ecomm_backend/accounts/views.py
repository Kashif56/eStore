from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout

from orders.models import OrderItem
from .models import CustomUser, Address
from .serializers import CustomUserSerializer, AddressSerializer

# Import Avg
from django.db.models import Avg

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user:
                return Response({
                    'status': 'success',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
        return Response({
            'status': 'error',
            'message': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            serializer = CustomUserSerializer(user)
            return Response({
                'status': 'success',
                'data': serializer.data
            })
        else:
            return Response({
                'status': 'error',
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def logout_view(request):
    try:
        logout(request)
        return Response({
            'status': 'success',
            'message': 'Logged out successfully'
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    try:
        user = request.user
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone_number': user.phone_number,
            'date_joined': user.date_joined,
            'avatar': request.build_absolute_uri(user.avatar.url) if user.avatar else None,
            'last_login': user.last_login,
            'updated_at': user.updated_at,
            'ordersCount': OrderItem.objects.filter(user=request.user, is_ordered=True).count(),

            'reviewsCount': user.reviews.count(),
            'avgRating': user.reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'],
        }
        return Response({
            'status': 'success',
            'data': data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_addresses(request):
    try:
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_address(request):
    try:
        request.data['user'] = request.user.id
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            address = serializer.save(user=request.user)
            return Response({
                'status': 'success',
                'data': AddressSerializer(address).data
            })
        return Response({
            'status': 'error',
            'message': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_address(request, address_id):
    try:
        address = Address.objects.get(id=address_id, user=request.user)
    except Address.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Address not found'
        }, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        address.delete()
        return Response({
            'status': 'success',
            'message': 'Address deleted successfully'
        })

    if request.method == 'PUT':
        serializer = AddressSerializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            address = serializer.save()
            return Response({
                'status': 'success',
                'data': serializer.data
            })
        return Response({
            'status': 'error',
            'message': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_default_address(request, address_id):
    try:
        address = Address.objects.get(id=address_id, user=request.user)
        # Remove default from other addresses
        Address.objects.filter(user=request.user, is_default=True).update(is_default=False)
        # Set new default
        address.is_default = True
        address.save()
        return Response({
            'status': 'success',
            'data': AddressSerializer(address).data
        })
    except Address.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Address not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_avatar(request):
    try:
        if 'avatar' not in request.FILES:
            return Response({'status': 'error', 'message': 'No avatar file provided'}, status=400)
        
        user = request.user
        # Delete old avatar if it exists
        if user.avatar:
            user.avatar.delete(save=False)
        
        user.avatar = request.FILES['avatar']
        user.save()
        
        return Response({
            'status': 'success',
            'message': 'Avatar updated successfully',
            'data': {
                'avatar_url': request.build_absolute_uri(user.avatar.url) if user.avatar else None
            }
        })
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=500)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    try:
        user = request.user
        data = request.data
        
        # Update basic fields
        allowed_fields = ['first_name', 'last_name', 'email', 'phone_number']
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
        
        # Handle date_of_birth separately
        if 'date_of_birth' in data:
            try:
                if data['date_of_birth'] and data['date_of_birth'].strip():
                    user.date_of_birth = data['date_of_birth']
                else:
                    user.date_of_birth = None
            except Exception as e:
                return Response({
                    'status': 'error',
                    'message': 'Invalid date format for date of birth'
                }, status=400)
        
        # Validate email uniqueness if changed
        if 'email' in data and data['email'] != user.email:
            if CustomUser.objects.filter(email=data['email']).exclude(id=user.id).exists():
                return Response({
                    'status': 'error',
                    'message': 'This email is already in use.'
                }, status=400)
        
        user.save()
        
        # Return updated user data
        return Response({
            'status': 'success',
            'message': 'Profile updated successfully',
            'data': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone_number': user.phone_number,
                'date_joined': user.date_joined,
                'avatar': request.build_absolute_uri(user.avatar.url) if user.avatar else None,
                'date_of_birth': user.date_of_birth.isoformat() if user.date_of_birth else None,
                'last_login': user.last_login,
                'updated_at': user.updated_at
            }
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=400)
