var helpers = require('dustjs-helpers').helpers;

module.exports = function i18nHelper(chunk, context, bodies, params) {
	var Jed 	 = context.global.lang ? context.global.lang : require(context.templateName.replace('.dust', '.po')),
	    singular = helpers.tap(params.singular, chunk, context),
	    plural   = helpers.tap(params.plural, chunk, context),
	    value    = helpers.tap(params.value, chunk, context);

	if(bodies.block !== undefined) {
		bodies.block({
			w: function(val) {
				singular = val;
			},
			write: function(val) {
				singular = val;
			}
		}, context);
	}

	var result;
	if (Jed) {
		result = Jed.ngettext(singular, plural, value);
	}

	if (result) {
		return chunk.write(result);
	}
	return chunk.write('');
};