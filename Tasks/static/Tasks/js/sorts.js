function ChangeGroup(groupname, rawgroupname, itemname){
	$(".item[task='" + itemname + "']").attr("group", groupname);
	$(".item[task='" + itemname + "']").attr("groupraw", groupname);
}

function EditOrder( event, ui ){
	groups = [];
	iter = 0
	$(".group-list-item").each(function(index, value){
		items = [];
		$(".item[group='" + $(this).attr("group") + "']").each(function(index, value){
			items.push($(this).attr("taskraw"));
		});
		itemstring = items.join(",");
		groups.push([$(this).attr("groupraw") + ":" + iter.toString() + ":" + itemstring]);
		iter += 1;
	});
	groupstring = groups.join("/");
	$.post("item_order_update", 
		{
		newgroups: groupstring,
		name: Cookies.get("username"),
		token: Cookies.get("token"),
		});	
}

$(document).ready(function(){
	$('.TaskList').sortable({
		group : 'tasks',
		animation : 150,
		filter: '.filtered',
		handle: '.handle',
		onUpdate: EditOrder,
		onAdd: function(event, ui){
			ChangeGroup($(event.to).attr("group"), $(event.to).attr("groupraw") ,$(event.item).attr("task"));
			EditOrder( event, ui );
		},
	});

	$('.GroupList').sortable({
		group : 'groups',
		animation : 150,
		handle: '.group-handle',
		onUpdate: function( event, ui ) {
			groups = [];
			iter = 0
			$(".group-list-item").each(function(index, value){
				groups.push([$(this).attr("groupraw") + ":" + iter.toString()]);
				iter += 1;
			});
			groupstring = groups.join("/");
			$.post("group_order_update", 
			{
				newgroups: groupstring,
				name: Cookies.get("username"),
				token: Cookies.get("token"),
			});	
		},
	});
});