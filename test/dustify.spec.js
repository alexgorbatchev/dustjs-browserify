var chai       = require('chai');
var browserify = require('browserify');
var dustify    = require('../lib/dustify.js');
var vm         = require('vm');

var expect = chai.expect;

describe('dustify', function () {
  var results;

  describe('callback', function () {
    beforeEach(function (done) {
      var testBundle = browserify();
      testBundle.transform(dustify);
      testBundle.add(__dirname + '/callback.js');

      testBundle.bundle(function (err, value) {
        var context = {
          done: function (err, html) {
            results = html;
            done(err);
          }
        };
        vm.runInNewContext(value, context);
      });
    });

    it('returns correct results', function () {
      expect(results).to.equal('Hello Alex!');
    });
  });

  describe('promise', function () {
    beforeEach(function (done) {
      var testBundle = browserify();
      testBundle.transform(dustify, {promises: 'bluebird'});
      testBundle.add(__dirname + '/promise.js');

      testBundle.bundle(function (err, value) {
        var context = {
          setTimeout: setTimeout,
          done: function (html) {
            results = html;
            done();
          }
        };
        vm.runInNewContext(value, context);
      });
    });

    it('returns correct results', function () {
      expect(results).to.equal('Hello Alex!');
    });
  })

  describe('partials', function () {
    beforeEach(function (done) {
      var testBundle = browserify();
      testBundle.transform(dustify);
      testBundle.add(__dirname + '/partials.js');

      testBundle.bundle(function (err, value) {
        var context = {
          done: function (err, html) {
            results = html;
            done(err);
          }
        };
        vm.runInNewContext(value, context);
      });
    });

    it('returns correct results', function () {
      expect(results).to.equal('Hello Alex!');
    });
  })
});
