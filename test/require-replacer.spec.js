'use strict';

var replacer = require('../.'),
	assert = require('assert');

describe('require-replacer', function () {

	function addHelloAdvice(methodCall) {
		return ['Hello', methodCall.proceed()].join(' ');
	}

	function getPineappleAdvice() {
		return 'pineapple';
	}

	function alterConstructorAdvice(methodCall) {
		methodCall.proceed();

		this.name = 'Hello ' + this.name;

		// override prototype
		var originalGetName = this.getName.bind(this);
		this.getName = function () {
			return originalGetName() + 'PINEAPPLE TARTS MUHAHAHAHA';
		};

		return this;
	}

	var functionExportProp = './props/function-export',
		objectExportProp = './props/object-export',
		constructorExportProp = './props/constructor-export';

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

	it('should correctly advise a constructor', function () {
		replacer.replace(alterConstructorAdvice, constructorExportProp);

		var World = require(constructorExportProp);
		var newWorld = new World();

		assert.equal(newWorld.name, 'Hello world');
		assert.equal(newWorld.getName(), 'Hello worldPINEAPPLE TARTS MUHAHAHAHA');
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