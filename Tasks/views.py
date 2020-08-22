import os
from django.shortcuts import render, redirect
from django.http import HttpResponse
from BLib.Files.ReadWrite import GetLinesAsList, Touch
from BLib.Network.Connection import Connection
from BLib.Network.Formatting import RemoveNullTerminator
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
		
class Group:
	def __init__(self, name, items, position):
		self.name = name
		self.items = items
		self.position = position
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

def GetTasks(name, token, group):
	con = Connection('192.168.86.29', 8080)
	con.Send(f'R/{name}/{group}/{token}')
	code = con.WaitUntilRecv(format_incoming=RemoveNullTerminator)
	print(code)
	error = TokenErrorHandler(code)
	if error:
		return
	con.Send('Ready')
	updated_items = con.RecvList('GO', 'END')
	con.Close()
	return updated_items
	
def GetGroups(name, token):
	con = Connection('192.168.86.29', 8080)
	con.Send(f'G/{name}/NULL/{token}')
	code = con.WaitUntilRecv(format_incoming=RemoveNullTerminator)
	print(code)
	error = TokenErrorHandler(code)
	if error:
		return
	con.Send('Ready')
	groups = con.RecvList('GO', 'END')
	con.Close()
	return groups
	
def ItemtoText(items):
    out = ''
    for i in items:
        if items.index(i) == 0:
            out += f'{i.name},{i.done}'
        else:
            out += f'\n{i.name},{i.done}'
    return out
	
def PushTasks(name, token, group, item, pos):
	if not len(item) == 0:
		items = ItemtoText(item)
		items = items.split('\n')
	else:
		items = ["NONE"]
	items.insert(0, str(pos))
	con = Connection('192.168.86.29', 8080)
	con.Send(f'W/{name}/{group}/{token}')
	code = con.WaitUntilRecv(format_incoming=RemoveNullTerminator)
	print(code)
	error = TokenErrorHandler(code)
	if error:
		return
	con.Send('Ready')
	con.SendList('GO', 'END', items, from_cpp=True)
	con.Close()
	
def RenameGroup(name, token, group, newname):
	con = Connection('192.168.86.29', 8080)
	con.Send(f'N/{name}/{group}/{token}')
	code = con.WaitUntilRecv(format_incoming=RemoveNullTerminator)
	print(code)
	error = TokenErrorHandler(code)
	if error:
		return
	con.Send('Ready')
	con.WaitUntilRecv(format_incoming=RemoveNullTerminator)
	con.Send(newname)
	con.Close()
	
def DeleteTasks(name, group, token):
	con = Connection('192.168.86.29', 8080)
	con.Send(f'D/{name}/{group}/{token}')
	code = con.WaitUntilRecv(format_incoming=RemoveNullTerminator)
	error = TokenErrorHandler(code)
	if error:
		return
	con.Send('Ready')
	con.Close()
	
def GetAllGroups(username, token, sort=True):
	groups = []
	groupsraw = GetGroups(username, token)
	if groupsraw is None:
		return []
	for group in groupsraw:
		tasksraw = GetTasks(username, token, group)
		pos = tasksraw.pop(0)
		if tasksraw[0] == "NONE":
			groups += [Group(group, [], int(pos))]
			continue
		tasks = []
		for rawtask in tasksraw:
			tasklist = rawtask.split(',')
			tasks += [Task(tasklist[0], truefalse[tasklist[1]])]
		groups += [Group(group, tasks, int(pos))]
		tasklength = 1
	for i in groups:
		for g in i.items:
			print(f'{i}-{g}-{g.done}')
	if len(groups) > 1 and sort:
		groups.sort(key=lambda x: x.position)
	if groups is None:
		groups = []
	return groups
	
def UpdateItemOrder(request):
	if request.method == 'POST':
		token = request.POST.get("token", "")
		username = request.POST.get("name", "")
		newgroups = request.POST.get("newgroups" , "")
		oldgroups = GetAllGroups(username, token)
		masteritems = []
		for i in oldgroups:
			masteritems += i.items
		itemdict = {}
		for i in masteritems:
			itemdict[i.name] = i
		newgroups = newgroups.split('/')
		newgroupobjects = []
		for i in newgroups:
			name = i.split(':')[0]
			pos = i.split(':')[1]
			items = i.split(':')[2]
			itemobjects = []
			for i in items.split(','):
				if not i == '':
					itemobjects += [itemdict[i]]
			newgroupobjects += [Group(name, itemobjects, pos)]
		for i in newgroupobjects:
			print(f'{i.name}-{i.items}')
			PushTasks(username, token, i.name, i.items, i.position)
		return HttpResponse("Success")
	else:
		return HttpResponse("Non-Post Request")
	
def UpdateGroupOrder(request):
	if request.method == 'POST':
		token = request.POST.get("token", "")
		username = request.POST.get("name", "")
		newgroups = request.POST.get("newgroups" , "")
		oldgroups = GetAllGroups(username, token)
		newgroups = newgroups.split('/')
		groupdict = {}
		for i in oldgroups:
			groupdict[i.name] = i
		for i in newgroups:
			partner = groupdict[i.split(':')[0]]
			partner.pos = i.split(':')[1]
		for i in oldgroups:
			PushTasks(username, token, i.name, i.items, i.pos)
		return HttpResponse("Success")
	else:
		return HttpResponse("Non-Post Request")
	
def updatetask(request):
	if request.method == 'POST':
		ToUpdate = request.POST.get("taskname", "")
		newname = request.POST.get("newname", "")
		print(f'[DEBUG]: newname: {newname}')
		if newname == '':
			newname = ToUpdate
		username = request.POST.get("name", "")
		token = request.POST.get("token", "")
		group = request.POST.get("group", "")
		done = request.POST.get("done", "")
		tasksraw = GetTasks(username, token, group)
		pos = tasksraw.pop(0)
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
		PushTasks(username, token, group, tasks, pos)
		return HttpResponse("Success")
	else:
		return HttpResponse("Non-Post Request")
		
def addtask(request):
	if request.method == 'POST':
		ToUpdate = request.POST.get("taskname", "")
		username = request.POST.get("name", "")
		token = request.POST.get("token", "")
		done = request.POST.get("done", "")
		group = request.POST.get("group", "")
		tasksraw = GetTasks(username, token, group)
		pos = tasksraw.pop(0)
		print(tasksraw)
		tasks = []
		if not tasksraw[0] == "NONE":
			#Add Auth server and login stuff here
			for rawtask in tasksraw:
				tasklist = rawtask.split(',')
				tasks += [Task(tasklist[0], truefalse[tasklist[1]])]
		tasks += [Task(ToUpdate, truefalse[done])]
		if '' in tasks:
			tasks.remove('')
		PushTasks(username, token, group, tasks, pos)
		return HttpResponse("Success")
	else:
		return HttpResponse("Non-Post Request")
		
def removetask(request):
	if request.method == 'POST':
		ToDelete = request.POST.get("taskname", "")
		ToDelete = unquote(ToDelete)
		username = request.POST.get("name", "")
		token = request.POST.get("token", "")
		group = request.POST.get("group", "")
		print(f'TODELETE: {ToDelete}')
		tasksraw = GetTasks(username, token, group)
		tasks = []
		pos = tasksraw.pop(0)
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
		PushTasks(username, token, group, tasks, pos)
		return HttpResponse("Success")
	else:
		return HttpResponse("Non-Post Request")
	
def creategroup(request):
	if request.method == 'POST':
		username = request.POST.get("name", "")
		token = request.POST.get("token", "")
		group = request.POST.get("group", "")
		groups = GetAllGroups(username, token)
		PushTasks(username, token, group, [], len(groups) + 1)
		return HttpResponse("Success")
	else:
		return HttpResponse("Non-Post Request")
		
def renamegroup(request):
	if request.method == 'POST':
		newname = request.POST.get("newname", "")
		print(newname)
		username = request.POST.get("name", "")
		token = request.POST.get("token", "")
		group = request.POST.get("group", "")
		RenameGroup(username, token, group, newname)
		return HttpResponse("Success")
	else:
		return HttpResponse("Non-Post Request")
		
		
def delete_group(request):
	if request.method == 'POST':
		username = request.POST.get("name", "")
		token = request.POST.get("token", "")
		group = request.POST.get("group", "")
		DeleteTasks(username, group, token)
		return HttpResponse("Success")
	else:
		return HttpResponse("Non-Post Request")

def index(request):
	user = request.COOKIES.get('username')
	if not user:
		return redirect('/users/login')
	token = request.COOKIES.get('token')
	if not token:
		return redirect('/users/login')
	groups = GetAllGroups(user, token)
	grouplength = len(groups)
	return render(request, 'tasklist.html', {'groups' : groups, 'name' : user, 'grouplength' : grouplength, 'needed': ["Tasks/js/js.cookie.min.js", "Tasks/js/taskadd.js", "Tasks/js/taskupdate.js", "Tasks/js/groupedit.js", "Tasks/js/sorts.js", "Tasks/js/jquery-sortable.js"]})
