from django.shortcuts import render

def Home(request):
	return render(request, 'home.html')
	
def Copyright(request):
	return render(request, 'copyright.html')
	
def Download(request):
	return render(request, 'download.html')
