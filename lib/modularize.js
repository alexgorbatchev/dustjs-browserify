/*
 * Copyright 2015 Scott Brady
 * MIT License
 * https://github.com/scottbrady/dustjs-loader/blob/master/LICENSE
 */

function escape(name) {
  return name.replace(/\\/g, '\\\\');
}

module.exports = {
  wrap: function(name, template) {
    name = escape(name);

    return "" +
      "(function() {\n" +
      "var dust = require('dustjs-linkedin');\n" +
      template +
      "module.exports = function (context, callback) { dust.render(\"" + name + "\", context || {}, callback); };\n" +
      "}).call(this);\n";
  },

  wrapWithPromise: function(name, template, promises) {
    var promisesRequire = '';

    // `true` value indicates user wants ES6 promises or possibly a registered polyfill
    if (promises && promises !== true) {
      promisesRequire = "var Promise = require('" + promises + "');\n";
    }

    name = escape(name);

    return "" +
      "(function() {\n" +
      "  var dust = require('dustjs-linkedin');\n" +
      promisesRequire +
      template +
      "  module.exports = function (context) {\n" +
      "    context.__required = true;\n" +
      "    return new Promise(function (resolve, reject) {\n" +
      "      dust.render(\"" + name + "\", context || {}, function (error, html) {\n" +
      "        if (error) { reject(error); return; }\n" +
      "        resolve(html);\n" +
      "      });\n" +
      "    });\n" +
      "  };\n" +
      "}).call(this);";
  }
};
