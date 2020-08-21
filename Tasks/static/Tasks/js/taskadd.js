

function CheckForInvalidCharacters(instr){
	not_allowed = ['/', '.', ',', ':', ';', '"', "'", '\\', '|', '+', '=', '_', '~', '`'];
	for (i=0; i<not_allowed.length; i++){
		if (instr.includes(not_allowed[i])){
			return true;
		}
	}
	
	return false;
	
}

function AddItemAddHandler(){
	$("#TaskAdd").click(function(){
		AddItem();
	});
}

function AddItem(){
	name = document.getElementById("AddField").value;
	done = "false";
	
	if (name == ""){
			return;
		}
		else if (CheckForInvalidCharacters(name)){
			return;
		}
	
	$.post("add", 
		{
			taskname: name,
			done: done,
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


$(document).ready(function(){
	AddItemAddHandler();
});