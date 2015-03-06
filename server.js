var express         = require('express'),
    fs              = require('fs'),
    path            = require('path'),
    po2json         = require('po2json'),
    Jed             = require('jed'),
    dust            = require('dustjs-linkedin'),
    xgettextDust    = require('xgettext-dust'),
    browserify      = require('connect-browserify'),
    dustify         = require('./dustify'),
    jedify          = require('jedify');

var app = express();

app.use(express.static(path.resolve(__dirname, 'public')));

app.set('views', path.resolve(__dirname, 'views'));

/** Install pofile extension to enable loading of translation files **/
require.extensions['.po'] = function requirePoFile(module, filename) {
	var content = fs.readFileSync(filename, 'utf8'),
	    poJSON  = po2json.parse(content, { format: 'jed' });

	module.exports = new Jed(poJSON);
};

// support ability to require dust templates
require.extensions['.dust'] = function requireDust(module, filename) {
	var content = fs.readFileSync(filename, 'utf8'),
		tpl     = dust.compileFn(content, filename);

	updateTranslations(filename);

	module.exports = tpl;
};

app.engine('dust', function dustEngine(path, options, callback) {
	var tmpl = require(path);

	updateTranslations(path);

	tmpl(options, callback);
});
app.set('view engine', 'dust');

// install our i18n helper
dust.helpers.i18n = require('./i18n-helper');

function updateTranslations(filename) {
	// extract translations
	var poFile = xgettextDust.parseFiles('/**/*.dust', {
		version: require('./package.json').version,
		root: app.get('views')
	});
	
	// write po file out
	try {
		fs.writeFileSync(filename.replace('.dust', '.po'), poFile, 'utf8');
	} catch(e) { }
}

app.get('/', function(req, res) {
	res.render('index', {
		first_name: 'Johnathan',
		message_count: 50
	});
});

app.use('/js/app.js', browserify({
	entry: path.resolve(__dirname, 'src/app.js'),
	contentType: 'text/javascript',

	requirements: [path.resolve(__dirname, 'views')],

	extensions: ['.dust', '.po'],

	transforms: [dustify, jedify]
}));

app.listen(8000, function() {
	console.log('Started server on 0.0.0.0:8000');
});