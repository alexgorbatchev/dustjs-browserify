/*
 * Copyright 2015 Scott Brady
 * MIT License
 * https://github.com/scottbrady/dustjs-browserify/blob/master/LICENSE
 */

var path       = require('path');
var through    = require('through');
var dust       = require('dustjs-linkedin');
var modularize = require('./modularize');

/**
 * Browserify plugin to convert dustjs templates to Javascript.
 *
 * Example:
 *
 * $ browserify -t dustify foo.dust > bundle.js
 **/

function isDust (filename) {
  return (/\.dust$/).test(filename);
}

module.exports = function (filename, options) {
  var source = '';
  var stream;


  options = options || {};

  if (!isDust(filename)) {
    return through();
  }

  // save a file chunk
  function write(chunk) {
    source += chunk.toString();
  }

  // end the process
  function end() {
    var name     = filename.replace(path.join(process.cwd(), '/'), '');
    var re       = /\.p\("([^"]*)",/g;
    var requires = '';

    var template;
    var compiled;
    var match;
    var childTemplate;
    var childTemplatePath;

    if (options.path) {
      name = name.replace(path.join(options.path, '/'), '');
    }

    name = name.replace(path.extname(name), '').replace(/\\/g, '/');
    template = dust.compile(source, name);

    // find all references to partials
    while (match = re.exec(template)) {
      childTemplate     = match[1];
      childTemplatePath = path.relative(
        path.dirname(filename),
        path.join(process.cwd(), options.path ? options.path : '', childTemplate)
      );
      
      childTemplatePath = childTemplatePath.replace(/\\/g, '\\\\');

      if (childTemplatePath[0] !== '.') {
        childTemplatePath = './' + childTemplatePath;
      }

      requires += "require('" + childTemplatePath + ".dust');\n";
    }

    template = requires + template;

    if (options.promise) {
      throw new Error('dustify: `promise` option is deprecated. Please see README.');
    }

    compiled = options.promises
      ? modularize.wrapWithPromise(name, template, options.promises)
      : modularize.wrap(name, template);

    stream.queue(compiled);
    stream.queue(null);
  }

  stream = through(write, end);

  return stream;
}
