var through = require("through"),
    dust = require("dustjs-linkedin"),
    fs   = require('fs');

var filenamePattern = /\.(dust|html)$/;

var wrap = function (filename, template) {
    var langPath = filename.replace('.dust', '.po');

    var i18n = '';
    if(fs.existsSync(langPath)) {
        i18n = 'var base = dust.makeBase({ lang: requirePo("' + langPath +  '")});';
    }

    return ['var dust = require("dustjs-linkedin/lib/dust");',  
        'dust.helpers = require("dustjs-helpers").helpers;',
        'dust.helpers.i18n = require("../i18n-helper.js");',
        'module.exports = function(data, cb) {',
            'if(!cb) {',
                'cb = data;',
                'data = {};' ,
            '}',
             i18n +
            'dust.render("', filename, '", base.push(data), cb);',
        '};', template].join('');
};

module.exports = function (file) {
    if (!filenamePattern.test(file)) return through();

    var input = "";
    var write = function(buffer) {
        input += buffer;
    };

    var end = function() {
        this.queue(wrap(file, dust.compile(input, file)));
        this.queue(null);
    };

    return through(write, end);
};