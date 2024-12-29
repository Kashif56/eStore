from rest_framework.response import Response
from rest_framework.decorators import api_view

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login

@api_view(['POST'])
def signup(request):
    

    return Response({"message": "Signup endpoint"})


@api_view(['POST'])
def login_user(request):
    if request.method == 'POST':
        print(request.data)
        
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return Response({"message": "Login successful"})
        else:
            return Response({"message": "Invalid credentials"}, status=400)
    else:
        return Response({"message": "Login endpoint"})



@api_view(['POST'])
def logout(request):
    return Response({"message": "Logout endpoint"})
