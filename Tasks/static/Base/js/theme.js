
const SubTypes = {
	
	//				   true	     false		    attribute
	
	".Sub-Prime" : 	["#343A40", "#F7F7F7", 	"background-color"	],
	".Sub-Text" : 	["white", 	"#1e3f56", 	"color"				],
	".Sub-BG" : 	["#2d2d2d", "#d6d6d6", 	"background-color"	],
	".Sub-Border" : ["white", 	"black", 	"border-color"		],
	
};

function UpdateVars(){
	
	for (var sub in SubTypes) {
		
		changes = SubTypes[sub];
		
		$(sub).each(function(){
			
			if ($(this).hasClass("Invert")){
				
				$(this).css(changes[2], Cookies.get("dark") == "true"? changes[1] : changes [0]);
				
			}
			else{
				
				$(this).css(changes[2], Cookies.get("dark") == "true"? changes[0] : changes [1]);
				
			}
			
		});
		
	}
	
	$("#ThemeSwitch").html(Cookies.get("dark") == "true"? "Light Mode" : "Dark Mode")
	
}

$(document).ready(function(){
	
	if (Cookies.get("dark") == undefined){	
		Cookies.set("dark", "false");
	}
	
	UpdateVars();
	
	$("#ThemeSwitch").click(function (){
		
		if (Cookies.get("dark") == "true"){
			Cookies.set("dark", "false");
		}
		else{
			Cookies.set("dark", "true");
		}
		
		UpdateVars();
		
	});
	
});