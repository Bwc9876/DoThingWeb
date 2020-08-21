import os
from django.shortcuts import render, redirect
from django.http import HttpResponse
from BLib.Files.ReadWrite import GetLinesAsList, Touch
from BLib.Network.Connection import Connection
from urllib.parse import unquote



truefalse = {
	"True" : True,
	"False" : False,
	"true" : True,
	"false" : False
	}

class Task:
	def __init__(self, name, done):
		self.name = name
		self.done = done
	def __str__(self):
		return self.name
		
		
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

def GetTasks(name, token):
	con = Connection('192.168.86.29', 8080)
	con.Send(f'R/{name}/{token}')
	code = con.WaitUntilRecv()
	error = TokenErrorHandler(code)
	if error:
		return
	con.Send('Ready')
	updated_items = con.RecvList('GO', 'END')
	con.Close()
	return updated_items
	
def ItemtoText(items):
    out = ''
    for i in items:
        if items.index(i) == 0:
            out += f'{i.name},{i.done}'
        else:
            out += f'\n{i.name},{i.done}'
    return out
	
def PushTasks(name, token, item):
    items = ItemtoText(item)
    items = items.split('\n')
    con = Connection('192.168.86.29', 8080)
    con.Send(f'W/{name}/{token}')
    code = con.WaitUntilRecv()
    error = TokenErrorHandler(code)
    if error:
        return
    con.Send('Ready')
    con.SendList('GO', 'END', items, from_cpp=True)
    con.Close()
	
def DeleteTasks(name, token):
	con = Connection('192.168.86.29', 8080)
	con.Send(f'D/{name}/{token}')
	code = con.WaitUntilRecv()
	error = TokenErrorHandler(code)
	if error:
		return
	con.Send('Ready')
	con.Close()
	
def updatetask(request):
	if request.method == 'POST':
		ToUpdate = request.POST.get("taskname", "")
		newname = request.POST.get("newname", "")
		print(f'[DEBUG]: newname: {newname}')
		if newname == '':
			newname = ToUpdate
		username = request.POST.get("name", "")
		token = request.POST.get("token", "")
		done = request.POST.get("done", "")
		tasksraw = GetTasks(username, token)
		tasks = []
		#Add Auth server and login stuff here
		for rawtask in tasksraw:
			tasklist = rawtask.split(',')
			tasks += [Task(tasklist[0], truefalse[tasklist[1]])]
		try:
			ToUpdate = [x for x in tasks if x.name == ToUpdate][0]
		except IndexError:
			print(f"ERROR: NO ITEM BY NAME {ToUpdate}")
			return HttpResponse("No Item By That Name")
		ToUpdate.name = newname
		ToUpdate.done = truefalse[done]
		PushTasks(username, token, tasks)
		return HttpResponse("Success")
	else:
		return HttpResponse("Non-Post Request")
		
def addtask(request):
	if request.method == 'POST':
		ToUpdate = request.POST.get("taskname", "")
		username = request.POST.get("name", "")
		token = request.POST.get("token", "")
		done = request.POST.get("done", "")
		tasksraw = GetTasks(username, token)
		tasks = []
		#Add Auth server and login stuff here
		for rawtask in tasksraw:
			tasklist = rawtask.split(',')
			tasks += [Task(tasklist[0], truefalse[tasklist[1]])]
		tasks += [Task(ToUpdate, truefalse[done])]
		if '' in tasks:
			tasks.remove('')
		PushTasks(username, token, tasks)
		return HttpResponse("Success")
	else:
		return HttpResponse("Non-Post Request")
		
def removetask(request):
	if request.method == 'POST':
		ToDelete = request.POST.get("taskname", "")
		ToDelete = unquote(ToDelete)
		username = request.POST.get("name", "")
		token = request.POST.get("token", "")
		print(f'TODELETE: {ToDelete}')
		tasksraw = GetTasks(username, token)
		tasks = []
		#Add Auth server and login stuff here
		for rawtask in tasksraw:
			tasklist = rawtask.split(',')
			tasks += [Task(tasklist[0], truefalse[tasklist[1]])]
		try:
			ToDelete = [x for x in tasks if x.name == ToDelete][0]
		except IndexError:
			print(f"ERROR: NO ITEM BY NAME {ToDelete}")
			return HttpResponse("No Item By That Name")
		tasks.remove(ToDelete)
		if '' in tasks:
			tasks.remove('')
		if len(tasks) == 0:
			DeleteTasks(username, token)
			return HttpResponse("Success")
		else:
			PushTasks(username, token, tasks)
			return HttpResponse("Success")
	else:
		return HttpResponse("Non-Post Request")
	
		
		


def index(request):
	#For now, set user equal to me to test rendering of tasks
	user = request.COOKIES.get('username')
	if not user:
		return redirect('/users/login')
	token = request.COOKIES.get('token')
	if not token:
		return redirect('/users/login')
	tasksraw = GetTasks(user, token)
	tasks = []
	#Add Auth server and login stuff here
	for rawtask in tasksraw:
		tasklist = rawtask.split(',')
		tasks += [Task(tasklist[0], truefalse[tasklist[1]])]
	tasklength = len(tasks)
	return render(request, 'tasklist.html', {'tasks' : tasks, 'name' : user, 'tasklength' : tasklength, 'needed': ["Tasks/js/taskadd.js", "Tasks/js/taskupdate.js", "Tasks/js/js.cookie.min.js"]})
