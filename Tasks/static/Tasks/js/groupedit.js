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

function DeleteGroup(groupname){
		$.post("remove_group", 
		{
			group: groupname,
			name: Cookies.get("username"),
			token: Cookies.get("token"),
		},
		function(data, status){
			if (data == "Success"){
				$("[id='" + groupname + "-Card']").remove()
				return;
			}
			else{
				$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + data + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			}
		});	
}

function CreateGroupDeleteHandler(){
	$(".GroupDelete").unbind().click(function(){
		DeleteGroup($(this).attr("group"));
	});
}

function UpdateGroupDeleteHandler(groupname){
	$("[id='" + groupname + "-GroupDelete']").unbind().click(function(){
		DeleteGroup($(this).attr("group"));
	});
}


function CreateGroupAddHandler(){
	$(".GroupAdd").unbind().click(function(){
		AddGroup();
	});
}


function CreateStartGroupEditHandler(){
	$(".GroupEdit").unbind().click(function(){
		StartGroupEdit($(this).attr("group"));
	});
}

function UpdateStartGroupEditHandler(groupname){
	$("[id='" + groupname + "-GroupEdit']").unbind().click(function(){
		StartGroupEdit($(this).attr('group'));
	});
}

function UpdateEndGroupEditHandler(groupname){
	$("[id='" + groupname + "-GroupDelete']").unbind().click(function(){
		EndGroupEdit($(this).attr('group'));
	});
}

function UpdateSubmitGroupEditHandler(groupname){
	$("[id='" + groupname + "-GroupEdit']").unbind().click(function(){
		SubmitGroupEdit($(this).attr('group'));
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



function SubmitGroupEdit(groupname){
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
			group: groupname,
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
edit_icon = "https://img.icons8.com/material-sharp/24/000000/edit.png";
confirm_icon = "https://img.icons8.com/android/24/000000/checkmark.png";
delete_icon = "https://img.icons8.com/material-rounded/24/000000/empty-trash.png";
cancel_icon = "https://img.icons8.com/fluent-systems-regular/24/000000/delete-sign.png";

function StartGroupEdit(groupname){
	$(".GroupEdit").each(function(index, value){
		EndGroupEdit($(this).attr('task'));
	});
	$("[id='" + groupname + "-EditIcon']").attr('src', confirm_icon);
	$("[id='" + groupname + "-DeleteIcon']").attr('src', cancel_icon);
	$("[id='GROUP-" + groupname + "-NameField']").show();
	UpdateEndGroupEditHandler(groupname);
	UpdateSubmitGroupEditHandler(groupname);
}


function EndGroupEdit(groupname){
	$("[id='" + groupname + "-EditIcon']").attr('src', edit_icon);
	$("[id='" + groupname + "-DeleteIcon']").attr('src', delete_icon);
	$("[id='GROUP-" + groupname + "-NameField']").hide();
	UpdateStartGroupEditHandler(groupname);
	UpdateGroupDeleteHandler(groupname);
}




$(document).ready(function(){
	CreateStartGroupEditHandler();
	CreateGroupAddHandler();
	CreateGroupDeleteHandler();
	$(".GroupAddField").hide();
});