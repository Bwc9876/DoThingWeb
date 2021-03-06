from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
	path('', views.index, name='index'),
	path('update', csrf_exempt(views.updatetask), name='update'),
	path('add', csrf_exempt(views.addtask), name='add'),
	path('remove', csrf_exempt(views.removetask), name='remove'),
	path('remove_group', csrf_exempt(views.delete_group), name='delete_group'),
	path('group_update', csrf_exempt(views.renamegroup), name='rename'),
	path('group_order_update', csrf_exempt(views.UpdateGroupOrder), name='group_order'),
	path('item_order_update', csrf_exempt(views.UpdateItemOrder), name='item_order'),
	path('add_group', csrf_exempt(views.creategroup), name='add_group'),
]
