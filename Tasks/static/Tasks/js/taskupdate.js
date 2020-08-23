$(window).bind('beforeunload', function(){
  $('.GroupButton').each(function(index, value){
	  document.cookie = $(this).attr("group") + "-expanded=" + $(this).attr("aria-expanded") + "; path=/"
	});
});

function SetExpandedOnCookies(){
		$('.GroupButton').each(function(index, value){
			expanded = Cookies.get($(this).attr("group") + "-expanded");
			if (expanded == "" || expanded == undefined){
				expand = false;
			}
			else{
				if (expanded == "true"){
					expand = true;
				}
				else{
					expand = false;
				}
			}
			
			if (expand == true){
				$("[id='" + $(this).attr("group") + "-collapse']").addClass("show");
			}
			else{
				$(this).addClass('collapsed');
			}
			
			$(this).attr('aria-expanded', expand);
		});
	}

function HandleChanges(oldname, newname, type){
	if (type == "task"){
		$(".change-task[task='" + oldname + "']").each(function(){
			$(this).attr("task", newname);
			suffix = $(this).attr('suffix');
			if (suffix != undefined){
				$(this).attr('id', newname + "-" + suffix);
			}
			fo = $(this).attr("for");
			if (fo != undefined){
				$(this).attr("for", newname + "-" + suffix)
			}
			name = $(this).attr("name");
			if (name != undefined){
				$(this).attr("name", newname + "-" + suffix)
			}
			datatarget = $(this).attr("data-target");
			if (datatarget != undefined){
				$(this).attr("name", "#" + newname + "-" + suffix)
			}
			ariacontrols = $(this).attr("aria-controls");
			if (ariacontrols != undefined){
				$(this).attr("name", newname + "-" + suffix)
			}
		});
	}
	else if (type == "group"){
		$(".change-group[group='" + oldname + "']").each(function(){
			$(this).attr("group", newname);
			suffix = $(this).attr('suffix');
			id = $(this).attr('id');
			if (suffix != undefined && id != undefined){
				$(this).attr('id', newname + "-" + suffix);
			}
			fo = $(this).attr("for");
			if (fo != undefined){
				$(this).attr("for", newname + "-" + suffix)
			}
			name = $(this).attr("name");
			if (name != undefined){
				$(this).attr("name", newname + "-" + suffix)
			}
			datatarget = $(this).attr("data-target");
			if (datatarget != undefined){
				$(this).attr("name", "#" + newname + "-" + suffix)
			}
			ariacontrols = $(this).attr("aria-controls");
			if (ariacontrols != undefined){
				$(this).attr("name", newname + "-" + suffix)
			}
		});
	}
}


function CreateCheckHandler(){
	$(".TaskCheck").change(function(){
		$.post("update", 
		{
			taskname: $(this).attr('task'),
			done: $(this).is(':checked'),
			group: $(this).attr('groupraw'),
			name: Cookies.get("username"),
			token: Cookies.get("token"),
		});	
	});
}

function CreateStartEditHandler(){
	$(".TaskEdit").unbind().click(function(){
		StartEdit($(this).attr("task"), $(this).attr("task"));
	});
}

function CreateDeleteItemHandler(){
	$(".TaskDelete").unbind().click(function(){
		DeleteItem($(this).attr('task'), $(this).attr('groupraw'));
	});
}

function UpdateStartEditHandler(taskid){
	$("[id='" + taskid + "-Edit']").unbind().click(function(){
		StartEdit($(this).attr('task'));
	});
}

function UpdateDeleteItemHandler(taskid){
	$("[id='" + taskid + "-Delete']").unbind().click(function(){
		DeleteItem($(this).attr('task'), $(this).attr('groupraw'));
	});
}

function UpdateEndEditHandler(taskid){
	$("[id='" + taskid + "-Delete']").unbind().click(function(){
		EndEdit($(this).attr('task'));
	});
}

function UpdateSubmitEditHandler(taskid){
	$("[id='" + taskid + "-Edit']").unbind().click(function(){
		SubmitEdit($(this).attr('task'));
	});
}

function CheckForInvalidCharacters(instr){
	not_allowed = ['/', '.', ',', ':', ';', '"', "'", '\\', '|', '+', '=', '_', '~', '`'];
	for (i=0; i<not_allowed.length; i++){
		if (instr.includes(not_allowed[i])){
			return not_allowed[i];
		}
	}
	
	return false;
	
}



function SubmitEdit(taskid){
		newname = document.getElementById(taskid + "-NameField").value;
		if (newname == "" || newname == undefined){
			$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Name Cannot Be Blank" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			return;
		}
		invalid = CheckForInvalidCharacters(newname)
		if (invalid !== "NO"){
			$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + 'Invalid Character: ' + invalid + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			return;
		}
		$.post("update", 
		{
			newname: newname,
			taskname: taskid,
			done: $("[id='" + taskid + "-Check']").is(':checked'),
			group: $("[id='" + taskid + "-Edit']").attr('groupraw'),
			name: Cookies.get("username"),
			token: Cookies.get("token"),
		},
		function(data, status){
			if (data == "Success"){
				window.location.reload(true);
				return;
			}
			else{
				$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + data + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			}
		});	
}

function DeleteItem(taskid, groupname){
		$.post("remove", 
		{
			taskname: encodeURIComponent(taskid),
			name: Cookies.get("username"),
			group: groupname,
			token: Cookies.get("token"),
		},
		function(data, status){
			if (data == "Success"){
				$(".list-group-item[task='" + taskid + "']").remove();
				return;
			}
			else{
				$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + data + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			}
		});	
}

function ChangeButtonText(id, newtext){
	$("[id='" + id + "']").html(newtext);
}

imgdict = {
	"edit_active" : "/static/Tasks/img/edit-active.png",
	"confirm_active" : "/static/Tasks/img/check-active.png",
	"delete_active" : "/static/Tasks/img/can-active.png",
	"cancel_active" : "/static/Tasks/img/delete-active.png",
	"edit_icon" : "/static/Tasks/img/edit.png",
	"confirm_icon" : "/static/Tasks/img/check.png",
	"delete_icon" : "/static/Tasks/img/can.png",
	"cancel_icon" : "/static/Tasks/img/delete.png",
}

function StartEdit(taskid){
	console.log("Start Edit");
	$(".TaskEdit").each(function(index, value){
		EndEdit($(this).attr('task'));
	});
	$("[id='" + taskid + "-EditIcon']").attr('src', imgdict.confirm_icon);
	$("[id='" + taskid + "-EditIcon']").attr("im", "check");
	$("[id='" + taskid + "-DeleteIcon']").attr('src', imgdict.cancel_icon);
	$("[id='" + taskid + "-DeleteIcon']").attr("im", "delete");
	$("[id='" + taskid + "-NameField']").show();
	UpdateEndEditHandler(taskid);
	UpdateSubmitEditHandler(taskid);
}


function EndEdit(taskid){
	$("[id='" + taskid + "-EditIcon']").attr('src', imgdict.edit_icon);
	$("[id='" + taskid + "-EditIcon']").attr("im", "edit");
	$("[id='" + taskid + "-DeleteIcon']").attr('src', imgdict.delete_icon);
	$("[id='" + taskid + "-DeleteIcon']").attr("im", "can");
	$("[id='" + taskid + "-NameField']").hide();
	UpdateStartEditHandler(taskid);
	UpdateDeleteItemHandler(taskid);
}




$(document).ready(function(){
	SetExpandedOnCookies();
	CreateCheckHandler();
	CreateStartEditHandler();
	CreateDeleteItemHandler();
	$(".NameField").hide();
	$(".ColorChange").mouseenter(function(){
		$(this).attr("src", "/static/Tasks/img/" + $(this).attr("im") + "-active.png");
	});
	$(".ColorChange").mouseleave(function(){
		$(this).attr("src", "/static/Tasks/img/" + $(this).attr("im") + ".png");
	});
	
});