from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
	path('', views.index, name='index'),
	path('update', csrf_exempt(views.updatetask), name='update'),
	path('add', csrf_exempt(views.addtask), name='add'),
	path('remove', csrf_exempt(views.removetask), name='remove'),
]
