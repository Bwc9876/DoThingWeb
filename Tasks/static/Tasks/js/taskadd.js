
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
	$(".TaskAdd").click(function(){
		AddItem($(this).attr("group"));
	});
}

function AddItem(groupname){
	name = document.getElementById(groupname + "-AddField").value;
	done = "false";
	
	if (name == "" || name == undefined){
			$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Name Cannot Be Blank" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			return;
		}
		else if (CheckForInvalidCharacters(name)){
			$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Invalid Character(s)" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			return;
		}
	
	$.post("add", 
		{
			taskname: name,
			done: done,
			name: Cookies.get("username"),
			group: groupname,
			token: Cookies.get("token"),
		},
		function(data, status){
			if (data == "Success"){
				return;
			}
			else{
				$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + data + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			}
		});	
}


$(document).ready(function(){
	AddItemAddHandler();
});