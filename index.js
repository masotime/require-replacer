'use strict';

var Module = require('module'),
	callsite = require('callsite'),
	path = require('path'),
	meld = require('meld');

module.exports = {
	replace: function replace(aroundFn, requirePath, property) {
		var toReplace, theKey, resolvedPath, isRelativeModule;

		isRelativeModule = ['.', '/'].some(function (starter) { return requirePath[0] === starter; });

		// get the caller's filename, get the directory of that, resolve against the require path.
		resolvedPath = isRelativeModule ? path.resolve(path.dirname(callsite()[1].getFileName()), requirePath) : requirePath;

		if (property === undefined) {
			try { toReplace = require(resolvedPath); } catch (e) { /* noop */ }
			if (typeof toReplace !== 'function') {
				console.error('An attempt to apply an around on require(\'%s\') which is not a function! (%s)', requirePath, typeof toReplace);
				console.error('require(\'%s\') resolves to %s', requirePath, resolvedPath);
				throw new Error('Attempt to replace a require that is not a function - ' + requirePath);
			} else {
				// let's do this the long and silly way (for now)
				theKey = Object
							.keys(Module._cache)
							.filter(function (key) {
								return Module._cache[key].exports === toReplace;
							})[0];

				meld.around(Module._cache[theKey], 'exports', aroundFn);
			}
		} else {
			try { toReplace = require(resolvedPath)[property]; } catch (e) { /* noop */ }

			if (typeof toReplace !== 'function') {
				console.error('You tried to apply an around on require(\'%s\').%s which is not a function! (%s)', requirePath, property, typeof toReplace);
				console.error('require(\'%s\') resolves to %s', requirePath, resolvedPath);
				throw new Error('Attempt to replace a require that is not a function - ' + requirePath);
			} else {
				meld.around(require(resolvedPath), property, aroundFn);
			}
		}

	}
};