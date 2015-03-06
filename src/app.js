var exampleTpl = require('../views/example.dust');

// render our template on the client
exampleTpl({
	first_name: 'Johnathan',
	message_count: 1
}, function(err, output) {
	setTimeout(function() {
		document.getElementById('client').innerHTML = output;
	}, 250);
});