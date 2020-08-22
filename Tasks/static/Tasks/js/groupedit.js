function CreateStartEditHandler(){
	$(".GroupEdit").unbind().click(function(){
		StartEdit($(this).attr("group"));
	});
}

function CreateDeleteItemHandler(){
	$(".GroupDelete").unbind().click(function(){
		DeleteItem($(this).attr('group'));
	});
}

function UpdateStartEditHandler(groupname){
	$("[id='" + groupname + "-Edit']").unbind().click(function(){
		StartEdit($(this).attr('group'));
	});
}

function UpdateDeleteItemHandler(groupname){
	$("[id='" + groupname + "-Delete']").unbind().click(function(){
		DeleteItem($(this).attr('group'));
	});
}

function UpdateEndEditHandler(groupname){
	$("[id='" + groupname + "-Delete']").unbind().click(function(){
		EndEdit($(this).attr('group'));
	});
}

function UpdateSubmitEditHandler(groupname){
	$("[id='" + groupname + "-Edit']").unbind().click(function(){
		SubmitEdit($(this).attr('group'));
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



function SubmitEdit(groupname){
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

function StartEdit(groupname){
	$(".GroupEdit").each(function(index, value){
		EndEdit($(this).attr('task'));
	});
	$("[id='" + groupname + "-EditIcon']").attr('src', confirm_icon);
	$("[id='" + groupname + "-DeleteIcon']").attr('src', cancel_icon);
	$("[id='GROUP-" + groupname + "-NameField']").show();
	UpdateEndEditHandler(groupname);
	UpdateSubmitEditHandler(groupname);
}


function EndEdit(groupname){
	$("[id='" + groupname + "-EditIcon']").attr('src', edit_icon);
	$("[id='" + groupname + "-DeleteIcon']").attr('src', delete_icon);
	$("[id='GROUP-" + groupname + "-NameField']").hide();
	UpdateStartEditHandler(groupname);
	UpdateDeleteItemHandler(groupname);
}




$(document).ready(function(){
	CreateCheckHandler();
	CreateStartEditHandler();
	CreateDeleteItemHandler();
	$(".NameField").hide();
});