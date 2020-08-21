
function CreateCheckHandler(){
	$(".TaskCheck").change(function(){
		console.log(Cookies.get("token"));
		$.post("update", 
		{
			taskname: $(this).attr('task'),
			done: $(this).is(':checked'),
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
		DeleteItem($(this).attr('task'));
	});
}

function UpdateStartEditHandler(taskname){
	$("[id='" + taskname + "-Edit']").unbind().click(function(){
		StartEdit($(this).attr('task'));
	});
}

function UpdateDeleteItemHandler(taskname){
	$("[id='" + taskname + "-Delete']").unbind().click(function(){
		DeleteItem($(this).attr('task'));
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
	//Make it so that later it gets the token/name from cookies and NOT directly 
		newname = document.getElementById(taskname + "-NameField").value;
		console.log(newname);
		console.log("[id='" + taskname + "-NameField']");
		if (newname == ""){
			return;
		}
		else if (CheckForInvalidCharacters(newname)){
			return;
		}
		$.post("update", 
		{
			newname: newname,
			taskname: $("[id='" + taskname + "-Edit']").attr('task'),
			done: $("[id='" + taskname + "-Check']").is(':checked'),
			name: Cookies.get("username"),
			token: Cookies.get("token"),
		},
		function(data, status){
			if (data == "Success"){
				window.location.reload(true);
				return;
			}
			else{
				console.log(data);
			}
		});	
}

function DeleteItem(taskname){
	//Make it so that later it gets the token/name from cookies and NOT directly 
		$.post("remove", 
		{
			taskname: encodeURIComponent($("[id='" + taskname + "-Delete']").attr('task')),
			name: Cookies.get("username"),
			token: Cookies.get("token"),
		},
		function(data, status){
			if (data == "Success"){
				window.location.reload(true);
				return;
			}
			else{
				console.log(data);
			}
		});	
}

function ChangeButtonText(id, newtext){
	$("[id='" + id + "']").html(newtext);
}
	

function StartEdit(taskname){
	$(".TaskEdit").each(function(index, value){
		EndEdit($(this).attr('task'));
	});
	ChangeButtonText(taskname + "-Edit", "Save");
	ChangeButtonText(taskname + "-Delete", "Cancel");
	$("[id='" + taskname + "-NameField']").show();
	UpdateEndEditHandler(taskname);
	UpdateSubmitEditHandler(taskname);
}


function EndEdit(taskname){
	ChangeButtonText(taskname + "-Edit", "Edit");
	ChangeButtonText(taskname + "-Delete", "Delete");
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