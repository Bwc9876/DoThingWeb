from django.shortcuts import render
from django.http import HttpResponse
from BLib.Network.Connection import Connection

def Register(username, password):
	# TODO: Add formatting error checks
	con = Connection('192.168.86.39', 8080)
	con.Send(f'R/{username}/{password}')
	d = con.WaitUntilRecv()
	con.Close()
	code = str(d).split("/")[0]
	try:
		token = str(d).split("/")[1]
		return f'{code}/{token}'
	except IndexError:
		return code
		
def Login(username, password):
	# TODO: Add formatting error checks
	con = Connection('192.168.86.39', 8080)
	con.Send(f'L/{username}/{password}')
	d = con.WaitUntilRecv()
	con.Close()
	code = str(d).split("/")[0]
	try:
		token = str(d).split("/")[1]
		return f'{code}/{token}'
	except IndexError:
		return code
		
def UserLogin(request):
	username = request.POST.get("username", "")
	password = request.POST.get("password", "")
	print(username)
	print(password)
	code = Login(username, password)
	return HttpResponse(code)

def UserRegister(request):
	username = request.POST.get("username", "")
	password = request.POST.get("password", "")
	code = Register(username, password)
	return HttpResponse(code)

def LoginPage(request):
	return render(request, 'login.html', {'needed':['Users/js/gettoken.js']})
	
def RegisterPage(request):
	return render(request, 'register.html', {'needed':['Users/js/gettoken.js']})
	
	


