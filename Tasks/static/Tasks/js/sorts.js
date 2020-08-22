$(document).ready(function(){
	$('.TaskList').sortable({
		group : 'tasks',
		animation : 150,
		filter: '.filtered',
		handle: '.handle',
		onMove: event => {
         return !event.related.classList.contains('disabled');
		}
	});
});

$(document).ready(function(){
	$('.GroupList').sortable({
		group : 'groups',
		animation : 150,
		filter: '.filtered',
		onMove: event => {
         return !event.related.classList.contains('disabled');
		}
	});
});