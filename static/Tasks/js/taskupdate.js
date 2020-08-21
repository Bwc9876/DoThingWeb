$(document).ready(function(){
	$(".TaskCheck").onchange(function(){
		//Make it so that later it gets the token/name from cookies and NOT directly 
		$.post("192.168.86.29:8000/tasks/update", 
		{
			taskname: $(this).task,
			done: $(this).checked,
			name: "bwc9876",
			token: "5h3I2<W@Sma367+i!Q?6I!p]v)$Bv0{US$)%.UPE^!Ch<bGCJd-PgViGY[!23=e0<p}R2PK.EcEYbX+m>$NoI6wzArF2uOA&U[Ev[J{D%qUGk2VVFEsVv$q:?8dT#<s$tmRhzSGI8.V1>*a{}%-suJ#_%(ofsxqpGRRt-5VXp(&KKt$F(GF7f)CixIjx@NvJgqIY7B1%$BqGN7-C*O*m-D=KhU6Mxno}=.QBidXo@d742y[t1SL0UNt|m-N:PafT"
		});	
	});
});