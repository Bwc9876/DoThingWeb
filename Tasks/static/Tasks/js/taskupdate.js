
function CreateCheckHandler(){
	$(".TaskCheck").change(function(){
		console.log(Cookies.get("token"));
		$.post("update", 
		{
			taskname: $(this).attr('task'),
			done: $(this).is(':checked'),
			group: $(this).attr('group'),
			name: Cookies.get("username"),
			token: Cookies.get("token"),
		});	
	});
}

function CreateStartEditHandler(){
	$(".TaskEdit").unbind().click(function(){
		StartEdit($(this).attr("task"));
	});
}

function CreateDeleteItemHandler(){
	$(".TaskDelete").unbind().click(function(){
		DeleteItem($(this).attr('task'), $(this).attr('group'));
	});
}

function UpdateStartEditHandler(taskname){
	$("[id='" + taskname + "-Edit']").unbind().click(function(){
		StartEdit($(this).attr('task'));
	});
}

function UpdateDeleteItemHandler(taskname){
	$("[id='" + taskname + "-Delete']").unbind().click(function(){
		DeleteItem($(this).attr('task'), $(this).attr('group'));
	});
}

function UpdateEndEditHandler(taskname){
	$("[id='" + taskname + "-Delete']").unbind().click(function(){
		EndEdit($(this).attr('task'));
	});
}

function UpdateSubmitEditHandler(taskname){
	$("[id='" + taskname + "-Edit']").unbind().click(function(){
		SubmitEdit($(this).attr('task'));
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



function SubmitEdit(taskname){
		newname = document.getElementById(taskname + "-NameField").value;
		if (newname == "" || newname == undefined){
			$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Name Cannot Be Blank" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			return;
		}
		else if (CheckForInvalidCharacters(newname)){
			$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Invalid Character(s)" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			return;
		}
		$.post("update", 
		{
			newname: newname,
			taskname: $("[id='" + taskname + "-Edit']").attr('task'),
			done: $("[id='" + taskname + "-Check']").is(':checked'),
			group: $("[id='" + taskname + "-Edit']").attr('group'),
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

function DeleteItem(taskname, groupname){
	//Make it so that later it gets the token/name from cookies and NOT directly 
		$.post("remove", 
		{
			taskname: encodeURIComponent($("[id='" + taskname + "-Delete']").attr('task')),
			name: Cookies.get("username"),
			group: groupname,
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

function StartEdit(taskname){
	$(".TaskEdit").each(function(index, value){
		EndEdit($(this).attr('task'));
	});
	$("[id='" + taskname + "-EditIcon']").attr('src', confirm_icon);
	$("[id='" + taskname + "-DeleteIcon']").attr('src', cancel_icon);
	$("[id='" + taskname + "-NameField']").show();
	UpdateEndEditHandler(taskname);
	UpdateSubmitEditHandler(taskname);
}


function EndEdit(taskname){
	$("[id='" + taskname + "-EditIcon']").attr('src', edit_icon);
	$("[id='" + taskname + "-DeleteIcon']").attr('src', delete_icon);
	$("[id='" + taskname + "-NameField']").hide();
	UpdateStartEditHandler(taskname);
	UpdateDeleteItemHandler(taskname);
}




$(document).ready(function(){
	CreateCheckHandler();
	CreateStartEditHandler();
	CreateDeleteItemHandler();
	$(".NameField").hide();
});