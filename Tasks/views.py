from django.shortcuts import render
from BLib.Files.ReadWrite import GetLinesAsList
# Create your views here.


from django.http import render


class Task:
	def __init__(self, name, done):
		self.name = name
		self.done = done
	def __str__(self):
		return self.name

def index(request):
	#For now, set user equal to me to test rendering of tasks
	user = 'bwc9876'
	taskpath = f'/home/dev/DoThingData/{user}.csv'
	token = 'TOKEN'
	tasks = []
	#Add Auth server and login stuff here
	if os.path.exists(taskpath):
		tasks_raw = GetLinesAsList(taskpath)
		for rawtask in tasks_raw:
			tasksplit = rawtask.split(',')
			tasks += [Task(tasksplit[0], bool(tasksplit[1]))]
	else:
		f = open(taskpath, 'w+')
		f.write('')
		f.close()
	return render(request, 'tasklist.html', {'tasks' : tasks, 'name' : user})
