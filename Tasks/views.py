import os
from django.shortcuts import render
from BLib.Files.ReadWrite import GetLinesAsList, Touch
from BLib.Network.Connection import Connection

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


def index(request):
	#For now, set user equal to me to test rendering of tasks
	user = 'bwc9876'
	token = '5h3I2<W@Sma367+i!Q?6I!p]v)$Bv0{US$)%.UPE^!Ch<bGCJd-PgViGY[!23=e0<p}R2PK.EcEYbX+m>$NoI6wzArF2uOA&U[Ev[J{D%qUGk2VVFEsVv$q:?8dT#<s$tmRhzSGI8.V1>*a{}%-suJ#_%(ofsxqpGRRt-5VXp(&KKt$F(GF7f)CixIjx@NvJgqIY7B1%$BqGN7-C*O*m-D=KhU6Mxno}=.QBidXo@d742y[t1SL0UNt|m-N:PafT'
	tasksraw = GetTasks(user, token)
	tasks = []
	#Add Auth server and login stuff here
	for rawtask in tasksraw:
		tasklist = rawtask.split(',')
		tasks += [Task(tasklist[0], bool(tasklist[1]))]
	tasklength = len(tasks)
	return render(request, 'tasklist.html', {'tasks' : tasks, 'name' : user, 'tasklength' : tasklength})
