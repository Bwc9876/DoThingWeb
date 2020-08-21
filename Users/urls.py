from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
	path('login', views.LoginPage, name='login'),
	path('register', views.RegisterPage, name='register'),
	path('request/login', csrf_exempt(views.UserLogin), name='login_request'),
	path('request/register', csrf_exempt(views.UserRegister), name='register_request'),
]