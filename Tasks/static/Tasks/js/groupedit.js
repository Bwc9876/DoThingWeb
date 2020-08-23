function GetGroupItems(groupname){
	items = [];
	$(".item[group='" + groupname + "']").each(function(index, value){
		items.push($(this).attr("taskraw"));
	});
	return items;
}

function AskBeforeDelete(groupname, groupraw){
	if (GetGroupItems(groupname).length > 0){
		$("#ConfirmDelete").attr("group", groupname);
		$("#ConfirmDelete").attr("groupraw", groupraw);
		$("#ConfirmDeleteModal").modal();
	}
	else{
		DeleteGroup(groupname, groupraw);
	}
}

function AddGroup(){
	name = document.getElementById("GroupAddField").value;
	done = "false";
	
	if (name == "" || name == undefined){
			$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Name Cannot Be Blank" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			return;
		}
		else if (CheckForInvalidCharacters(name)){
			$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Invalid Character(s)" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			return;
		}
	
	$.post("add_group", 
		{
			group: name,
			name: Cookies.get("username"),
			token: Cookies.get("token"),
		},
		function(data, status){
			if (data == "Success"){
				window.location.reload(true);
			}
			else{
				$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + data + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			}
		});	
}

function DeleteGroup(groupname, rawgroupname){
		$.post("remove_group", 
		{
			group: rawgroupname,
			name: Cookies.get("username"),
			token: Cookies.get("token"),
		},
		function(data, status){
			if (data == "Success"){
				Cookies.remove(groupname + "-expanded", { path: '/', domain: '192.168.86.29' });
				$("[id='" + groupname + "-Card']").remove()
				return;
			}
			else{
				$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + data + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			}
		});	
}

function CreateModalButtonDeleteHandler(){
	$("#ConfirmDelete").unbind().click(function(){
		DeleteGroup($(this).attr("group"), $(this).attr("groupraw"));
	});
}

function CreateGroupDeleteHandler(){
	$(".GroupDelete").unbind().click(function(){
		AskBeforeDelete($(this).attr("group"), $(this).attr("groupraw"));
	});
}

function UpdateGroupDeleteHandler(groupname){
	$("[id='" + groupname + "-GroupDelete']").unbind().click(function(){
		AskBeforeDelete($(this).attr("group"), $(this).attr("groupraw"));
	});
}


function CreateGroupAddHandler(){
	$(".GroupAdd").unbind().click(function(){
		AddGroup();
	});
}


function CreateStartGroupEditHandler(){
	$(".GroupEdit").unbind().click(function(){
		StartGroupEdit($(this).attr("group"), $(this).attr("groupraw"));
	});
}

function UpdateStartGroupEditHandler(groupname){
	$("[id='" + groupname + "-GroupEdit']").unbind().click(function(){
		StartGroupEdit($(this).attr('group'), $(this).attr("groupraw"));
	});
}

function UpdateEndGroupEditHandler(groupname){
	$("[id='" + groupname + "-GroupDelete']").unbind().click(function(){
		EndGroupEdit($(this).attr('group'), $(this).attr("groupraw"));
	});
}

function UpdateSubmitGroupEditHandler(groupname){
	$("[id='" + groupname + "-GroupEdit']").unbind().click(function(){
		SubmitGroupEdit($(this).attr('group'), $(this).attr("groupraw"));
	});
}

function CheckForInvalidCharacters(instr){
	not_allowed = ['/', '.', ',', ':', ';', '"', "'", '\\', '|', '+', '=', '_', '~', '`'];
	for (i=0; i<not_allowed.length; i++){
		if (instr.includes(not_allowed[i])){
			return true;
		}
	}
	
	return false;
	
}



function SubmitGroupEdit(groupname, rawgroupname){
		newname = document.getElementById("GROUP-" + groupname + "-NameField").value;
		if (newname == "" || newname == undefined){
			$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Name Cannot Be Blank" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			return;
		}
		else if (CheckForInvalidCharacters(newname)){
			$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Invalid Character(s)" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			return;
		}
		console.log(groupname);
		$.post("group_update", 
		{
			newname: newname,
			group: rawgroupname,
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

function ChangeButtonText(id, newtext){
	$("[id='" + id + "']").html(newtext);
}

function StartGroupEdit(groupname){
	$(".GroupEdit").each(function(index, value){
		EndGroupEdit($(this).attr('task'));
	});
	$("[id='" + groupname + "-EditIcon']").attr('src', imgdict.confirm_icon);
	$("[id='" + groupname + "-EditIcon']").attr("im", "check");
	$("[id='" + groupname + "-DeleteIcon']").attr('src', imgdict.cancel_icon);
	$("[id='" + groupname + "-DeleteIcon']").attr("im", "delete");
	$("[id='GROUP-" + groupname + "-NameField']").show();
	UpdateEndGroupEditHandler(groupname);
	UpdateSubmitGroupEditHandler(groupname);
}


function EndGroupEdit(groupname){
	$("[id='" + groupname + "-EditIcon']").attr('src', imgdict.edit_icon);
	$("[id='" + groupname + "-EditIcon']").attr("im", "edit");
	$("[id='" + groupname + "-DeleteIcon']").attr('src', imgdict.delete_icon);
	$("[id='" + groupname + "-DeleteIcon']").attr("im", "can");
	$("[id='GROUP-" + groupname + "-NameField']").hide();
	UpdateStartGroupEditHandler(groupname);
	UpdateGroupDeleteHandler(groupname);
}




$(document).ready(function(){
	CreateStartGroupEditHandler();
	CreateGroupAddHandler();
	CreateGroupDeleteHandler();
	CreateModalButtonDeleteHandler();
	$(".GroupAddField").hide();
});