'use strict';

var Module = require('module'),
	callsite = require('callsite'),
	path = require('path'),
	meld = require('meld');

function load(path) {
	var module, result = {
		path: path
	};

	try {
		module = require(path);
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

function handleOrGet(loadAttempt, requirePath, property) {
	var result;

	if (loadAttempt.error) {
		console.error('There was a problem loading require(\'%s\') - %s', requirePath, loadAttempt.error);
		console.error('require(\'%s\') resolves to absolute path %s', requirePath, loadAttempt.path);
		throw new Error(loadAttempt.error);
	}

	result = loadAttempt.module;
	if (result && property !== undefined) {
		result = result[property];
	}

	if (typeof result !== 'function') {
		console.error('An attempt to apply an around on require(\'%s\') which is not a function! (%s)', requirePath, typeof result);
		throw new Error('Attempt to replace a require that is not a function - ' + requirePath);
	}

	return result;
}

module.exports = {
	replace: function replace(aroundFn, requirePath, property) {
		var module, theKey, resolvedPath, isRelativeModule;

		isRelativeModule = ['.', '/'].some(function (starter) { return requirePath[0] === starter; });

		// get the caller's filename, get the directory of that, resolve against the require path.
		resolvedPath = isRelativeModule ? path.resolve(path.dirname(callsite()[1].getFileName()), requirePath) : requirePath;

		if (property === undefined) {
			module = handleOrGet(load(resolvedPath), requirePath);

			// let's do this the long and silly way (for now)
			theKey = Object
				.keys(Module._cache)
				.filter(function (key) {
					return Module._cache[key].exports === module;
				})[0];

			// meld has to be applied in context of the obejct holding the function,
			// it cannot be applied to the function without a context.
			meld.around(Module._cache[theKey], 'exports', aroundFn);
		} else {
			module = handleOrGet(load(resolvedPath), requirePath, property);
			meld.around(require(resolvedPath), property, aroundFn);
		}

	}
};