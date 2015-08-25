'use strict';

var Module = require('module'),
	callsite = require('callsite'),
	path = require('path'),
	meld = require('meld'),
	util = require('util');

function load(requirePath) {
	var module, isRelativeModule, result = {
		requirePath: requirePath
	};

	isRelativeModule = ['.', '/'].some(function (relPathFirstChar) {
		return requirePath && requirePath[0] === relPathFirstChar;
	});

	// get the caller's filename, get the directory of that, resolve against the require path.
	result.resolvedPath = isRelativeModule ? path.resolve(path.dirname(callsite()[2].getFileName()), requirePath) : requirePath;

	try {
		module = require(result.resolvedPath);
	} catch (e) {
		if (e.code === 'MODULE_NOT_FOUND') {
			result.error = 'Unable to locate the module. Is the path right?';
		} else if (e.message) {
			result.error = e.message;
		}
	}

	if (module !== undefined) {
		result.module = module;
	}

	return result;
}

function getFunction(loadAttempt, property) {
	var result, error;

	if (loadAttempt.error) {
		error = new Error('LoadError');
		error.message = util.format('There was a problem loading require(\'%s\') - %s', loadAttempt.requirePath, loadAttempt.error);
		error.message += '\n' + util.format('require(\'%s\') resolves to absolute path %s', loadAttempt.requirePath, loadAttempt.resolvedPath);
		throw error;
	}

	result = loadAttempt.module;
	if (result && property !== undefined) {
		result = result[property];
	}

	if (typeof result !== 'function') {
		error = new Error('LoadTypeError');
		error.message = util.format('Attempt to replace require(\'%s\') which is not a function! (%s)', loadAttempt.requirePath, typeof result);
		throw error;
	}

	return result;
}

module.exports = {
	replace: function replace(aroundFn, requirePath, property) {
		var fn, loadAttempt, theKey;

		loadAttempt = load(requirePath);

		if (property === undefined) {
			fn = getFunction(loadAttempt);

			// let's do this the long and silly way (for now)
			theKey = Object
				.keys(Module._cache)
				.filter(function (key) {
					return Module._cache[key].exports === fn;
				})[0];

			// meld has to be applied in context of the object holding the function,
			// it cannot be applied to the function without a context.
			meld.around(Module._cache[theKey], 'exports', aroundFn);
		} else {
			fn = getFunction(loadAttempt, property);
			meld.around(require(loadAttempt.resolvedPath), property, aroundFn);
		}

	}
};