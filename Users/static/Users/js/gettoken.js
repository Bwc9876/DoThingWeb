
function CheckForInvalidCharacters(instr){
	not_allowed = ['/', '.', ',', ':', ';', '"', "'", '\\', '|', '+', '=', '_', '~', '`'];
	for (i=0; i<not_allowed.length; i++){
		if (instr.includes(not_allowed[i])){
			return true;
		}
	}
	
	return false;
	
}


function AddLoginHandler(){
$(".UserLogin").click(function(){
	username = document.getElementById("UsernameField").value;
	password = document.getElementById("PasswordField").value;
	if (username == ""){
		$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Name Cannot Be Blank" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
		return;
	}
	if (password == ""){
		$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Password Cannot Be Blank" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
		return;
	}
	if (CheckForInvalidCharacters(username)){
		$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Invalid Character(s)" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
		return;
	}
	$.post("request/login", 
		{
			username: username,
			password: password,
		},
		function(data, status){
			if (data == "IL"){
				$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Username or Password was incorrect" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			}
			else if (data == "IE"){
				$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Internal Server Error" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			}
			else{
				document.cookie = "username=" + data.split("/")[0] + "; path=/;";
				document.cookie = "token=" + data.split("/")[1] + "; path=/;";
				window.location.href = "/";
			}
		});
	
})
}

function AddRegisterHandler(){
$(".UserRegister").click(function(){
	username = document.getElementById("UsernameField").value;
	password = document.getElementById("PasswordField").value;
	if (username == ""){
		$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Name Cannot Be Blank" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
		return;
	}
	if (password.length < 8){
		$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Password Too Short (7> characters)" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
		return;
	}
	if (CheckForInvalidCharacters(username)){
		$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Invalid Character(s)" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
		return;
	}
	$.post("request/register", 
		{
			username: username,
			password: password,
		},
		function(data, status){
			if (data == "UE"){
				$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Username already exists" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			}
			else if (data == "IE"){
				$('#PageContainer').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert">'  + "Internal Server Error" + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span> </button></div>');
			}
			else{
				console.log(data);
				document.cookie = "username=" + data.split("/")[0] + "; path=/;";
				document.cookie = "token=" + data.split("/")[1] + "; path=/;";
				window.location.href = "/";
			}
		});
	
})
}



$(document).ready(function(){
	if ($('#UserForm').attr("formtype") == "Login"){
		AddLoginHandler();
	}
	else if ($('#UserForm').attr("formtype") == "Register"){
		AddRegisterHandler();
	}
});