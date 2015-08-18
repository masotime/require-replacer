'use strict';

var replacer = require('../.'),
	assert = require('assert'),
	path = require('path');

describe('require-replacer', function () {

	function addHelloAdvice(methodCall) {
		return ['Hello', methodCall.proceed()].join(' ');
	}

	function getPineappleAdvice() {
		return 'pineapple';
	}

	var functionExportProp = './props/function-export',
		objectExportProp = './props/object-export';

	it('should correctly replace a function export', function () {
		replacer.replace(addHelloAdvice, functionExportProp);
		assert.equal(require(functionExportProp)(), 'Hello world');
	});

	it('should correctly replace an object export', function() {
		replacer.replace(addHelloAdvice, objectExportProp, 'test');
		assert.equal(require(objectExportProp).test(), 'Hello world');
	});

	it('should correctly replace a normal node module', function () {
		replacer.replace(getPineappleAdvice, 'fs', 'readFile');

		assert.equal(require('fs').readFile(), 'pineapple');
	});

	it('should NOT work if the require doesn\'t exist', function () {
		assert.throws( function() {
			replacer.replace(addHelloAdvice, 'does-not-exist');
		}, /Attempt to replace a require that is not a function/);
	});

	it('should NOT work if the require is not a function', function() {
		assert.throws( function() {
			replacer.replace(getPineappleAdvice, objectExportProp, 'notafunction');
		}, /Attempt to replace a require that is not a function/);
	});
});