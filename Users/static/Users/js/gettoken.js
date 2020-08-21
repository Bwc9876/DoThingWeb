
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
	if (username == "" || password == "" || CheckForInvalidCharacters(username)){
		return;
	}
	$.post("request/login", 
		{
			username: username,
			password: password,
		},
		function(data, status){
			if (data == "IL"){
				console.log("Invalid Login");
			}
			else if (data == "IE"){
				console.log("Internal Server Error");
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
	if (username == "" || password == "" || CheckForInvalidCharacters(username)){
		return;
	}
	$.post("request/register", 
		{
			username: username,
			password: password,
		},
		function(data, status){
			if (data == "UE"){
				console.log("User Exists");
			}
			else if (data == "IE"){
				console.log("Internal Server Error");
			}
			else{
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