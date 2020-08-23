import os
import random
from django.shortcuts import render, redirect
from django.http import HttpResponse
from BLib.Files.ReadWrite import GetLinesAsList, Touch
from BLib.Network.Connection import Connection
from BLib.Network.Formatting import RemoveNullTerminator
from urllib.parse import unquote
from termcolor import cprint 


def GenID(username, token):
	oldgroups = GetAllGroups(username, token)
	masteritems = []
	for i in oldgroups:
		masteritems += i.items
	while True:
		attempted_id =  random.randint(1,10001)
		if not IDExists(masteritems, attempted_id):
			break
	return attempted_id


def IDExists(tasks, id):
	for i in tasks:
		if i.id == id:
			return True
	return False

truefalse = {
	"True" : True,
	"False" : False,
	"true" : True,
	"false" : False
	}

class Task:
	def __init__(self, id, name, done):
		self.id = id
		self.name = name
		self.done = done
		self.safename = name.replace(' ', '_')
	def __str__(self):
		return self.name
		
class Group:
	def __init__(self, name, items, position):
		self.name = name
		self.items = items
		self.position = position
		self.safename = name.replace(' ', '_')
	def __str__(self):
		return self.name
		
		
def TokenErrorHandler(code):
	errors = {
		'IU' : 'The cached user does not exist',
		'IT' : 'The cached token is invalid for the cached user',
		'IE' : 'There was an internal server error'
	}
	try:
		error_log(f'{errors[code]} When Attempting Authentication')
		return errors[code]
	except KeyError:
		return False

def GetTasks(name, token, group):
	con = Connection('192.168.86.29', 8080)
	con.Send(f'R/{name}/{group}/{token}')
	code = con.WaitUntilRecv(format_incoming=RemoveNullTerminator)
	error = TokenErrorHandler(code)
	if error:
		return
	con.Send('Ready')
	updated_items = con.RecvList('GO', 'END')
	con.Close()
	return updated_items
	
def CreateTaskList(tasksraw):
	pos = tasksraw.pop(0)
	if tasksraw[0] == "NONE":
		return [], pos
	tasks = []
	for rawtask in tasksraw:
		tasklist = rawtask.split(',')
		tasks += [Task(tasklist[0], tasklist[1] ,truefalse[tasklist[2]])]
	return tasks, pos
	
	
def GetGroups(name, token):
	con = Connection('192.168.86.29', 8080)
	con.Send(f'G/{name}/NULL/{token}')
	code = con.WaitUntilRecv(format_incoming=RemoveNullTerminator)
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
            out += f'{i.id},{i.name},{i.done}'
        else:
            out += f'\n{i.id},{i.name},{i.done}'
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
		tasks, pos = CreateTaskList(tasksraw)
		groups += [Group(group, tasks, int(pos))]
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
			itemdict[i.id] = i
		newgroups = newgroups.split('/')
		newgroupobjects = []
		for i in newgroups:
			name = i.split(':')[0]
			pos = i.split(':')[1]
			item = i.split(':')[2]
			itemobjects = []
			for l in item.split(','):
				if not l == '':
					itemobjects += [itemdict[l]]
			newgroupobjects += [Group(name, itemobjects, pos)]
		for i in newgroupobjects:
			oldone = [x for x in oldgroups if x.name == i.name][0]
			if not oldone.items == i.items:
				PushTasks(username, token, i.name, i.items, i.position)
		debug_log(f"User '{username}' updated task order (Not Printing It Though).")
		return HttpResponse("Success")
	else:
		warn_log("Order Update Task Attempt But Not POST!")
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
		debug_log(f"User '{username}' updated group order {newgroups}.")
		return HttpResponse("Success")
	else:
		warn_log("Order Update Group Attempt But Not POST!")
		return HttpResponse("Non-Post Request")
	
def updatetask(request):
	if request.method == 'POST':
		ToUpdate = request.POST.get("taskname", "")
		newname = request.POST.get("newname", "")
		if newname == '':
			newname = None
		username = request.POST.get("name", "")
		token = request.POST.get("token", "")
		group = request.POST.get("group", "")
		done = request.POST.get("done", "")
		tasksraw = GetTasks(username, token, group)
		tasks, pos = CreateTaskList(tasksraw)
		try:
			ToUpdate = [x for x in tasks if x.id == ToUpdate][0]
			storename = ToUpdate.name
			storedone = ToUpdate.done
		except IndexError:
			error_log(f"No Item By ID {ToUpdate}")
			return HttpResponse("No Item By That Name")
		if newname is not None:
			ToUpdate.name = newname
		ToUpdate.done = truefalse[done]
		PushTasks(username, token, group, tasks, pos)
		debug_log(f"User '{username}' updated task {storename}|{storedone}>{ToUpdate.name}|{ToUpdate.done}.")
		return HttpResponse("Success")
	else:
		warn_log("Edit Task Attempt But Not POST!")
		return HttpResponse("Non-Post Request")
		
def addtask(request):
	if request.method == 'POST':
		ToUpdate = request.POST.get("taskname", "")
		username = request.POST.get("name", "")
		token = request.POST.get("token", "")
		done = request.POST.get("done", "")
		group = request.POST.get("group", "")
		if group == "":
			raise NameError("Group is empty!")
		tasksraw = GetTasks(username, token, group)
		tasks, pos = CreateTaskList(tasksraw)
		tasks += [Task(GenID(username, token),ToUpdate, truefalse[done])]
		if '' in tasks:
			tasks.remove('')
		PushTasks(username, token, group, tasks, pos)
		debug_log(f"User '{username}' added task {ToUpdate}.")
		return HttpResponse("Success")
	else:
		warn_log("Add Task Attempt But Not POST!")
		return HttpResponse("Non-Post Request")
		
def removetask(request):
	if request.method == 'POST':
		ToDelete = request.POST.get("taskname", "")
		ToDelete = unquote(ToDelete)
		username = request.POST.get("name", "")
		token = request.POST.get("token", "")
		group = request.POST.get("group", "")
		tasksraw = GetTasks(username, token, group)
		tasks, pos = CreateTaskList(tasksraw)
		try:
			ToDelete = [x for x in tasks if x.id == ToDelete][0]
		except IndexError:
			error_log(f"Task Not Found: '{ToDelete}' (called by removetask)")
			return HttpResponse("No Item By That Name")
		tasks.remove(ToDelete)
		if '' in tasks:
			tasks.remove('')
		PushTasks(username, token, group, tasks, pos)
		debug_log(f"User '{username}' removed task {ToDelete.name}.")
		return HttpResponse("Success")
	else:
		warn_log("Delete Task Attempt But Not POST!")
		return HttpResponse("Non-Post Request")
	
def creategroup(request):
	if request.method == 'POST':
		username = request.POST.get("name", "")
		token = request.POST.get("token", "")
		group = request.POST.get("group", "")
		groups = GetAllGroups(username, token)
		PushTasks(username, token, group, [], len(groups) + 1)
		debug_log(f"User '{username}' created group {group}.")
		return HttpResponse("Success")
	else:
		warn_log("Create Group Attempt But Not POST!")
		return HttpResponse("Non-Post Request")
		
def renamegroup(request):
	if request.method == 'POST':
		newname = request.POST.get("newname", "")
		username = request.POST.get("name", "")
		token = request.POST.get("token", "")
		group = request.POST.get("group", "")
		RenameGroup(username, token, group, newname)
		debug_log(f"User '{username}' renamed group {group}>{newname}.")
		return HttpResponse("Success")
	else:
		warn_log("Rename Group Attempt But Not POST!")
		return HttpResponse("Non-Post Request")

def debug_log(text):
	cprint(f"[DEBUG]", "grey", 'on_cyan', end=' ')
	print(text)
	
def error_log(text):
	cprint(f"[ERROR]", "grey", 'on_red', end=' ')
	print(text)
	
def warn_log(text):
	cprint(f"[WARNING]", "grey", 'on_yellow', end=' ')
	print(text)
		
def delete_group(request):
	if request.method == 'POST':
		username = request.POST.get("name", "")
		token = request.POST.get("token", "")
		group = request.POST.get("group", "")
		DeleteTasks(username, group, token)
		debug_log(f"User '{username}' deleted group {group}.")
		return HttpResponse("Success")
	else:
		warn_log("Delete Group Attempt But Not POST!")
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
	debug_log(f"User '{user}' loaded index.")
	return render(request, 'tasklist.html', {'groups' : groups, 'name' : user, 'grouplength' : grouplength, 'needed': ["Tasks/js/js.cookie.min.js", "Tasks/js/taskadd.js", "Tasks/js/taskupdate.js", "Tasks/js/groupedit.js", "Tasks/js/sorts.js", "Tasks/js/jquery-sortable.js"]})
