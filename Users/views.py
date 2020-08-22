from django.shortcuts import render
from django.http import HttpResponse
from BLib.Network.Connection import Connection
from BLib.Network.Formatting import RemoveNullTerminator

def TokenErrorHandler(code):
    errors = {
        'IU' : 'The cached user does not exist',
        'IT' : 'The cached token is invalid for the cached user',
        'IE' : 'There was an internal server error'
    }
    try:
        return errors[code]
    except KeyError:
        return False


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
	try:
		token = code.split('/')[1]
		error = False
	except:
		error = True
	
	if not error:
		con = Connection('192.168.86.29', 8080)
		con.Send(f'U/{username}/NULL/{token}')
		errorcode = con.WaitUntilRecv(format_incoming=RemoveNullTerminator)
		print(errorcode)
		errorcode = TokenErrorHandler(code)
		if error:
			return
		con.Send('Ready')
		con.Close()
	
	print(code)
	return HttpResponse(code)

def LoginPage(request):
	return render(request, 'login.html', {'needed':['Users/js/gettoken.js']})
	
def RegisterPage(request):
	return render(request, 'register.html', {'needed':['Users/js/gettoken.js']})
	
	


