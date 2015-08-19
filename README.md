# require-replacer

Replaces the function of a `require` (or property of the exports of a `require`) with an "around advice" via [meld][1].

## Usage

### Function export
Assuming that you have a module `lib/test.js`:

```
module.exports = function () {
	return 'world';
}
```

Then in your `index.js`:

```
var replacer = require('require-replacer');

replacer.replace(function around(methodCall) { 
	return 'Hello ' + methodCall.proceed();
}, './lib/test');

require('./lib/test')(); // 'Hello world'
```

### Object export
If you export an object instead

```
module.exports = {
	worldFn: function () {
		return 'world';
	}
};
```

Then instead

```
replacer.replace(function around(methodCall) { ...}, './lib/test', 'worldFn');
```

### Constructor export
If your module exports a constructor, e.g.

```
function World() {
	this.name = 'world';
}

World.prototype.getName = function() {
	return this.name;
};
```

then you may write an interceptor in the following manner e.g:

```
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

replacer.replace(alterConstructorAdvice, './World');
new require('./World')().getName(); // 'Hello worldPINEAPPLE TARTS MUHAHAHAHA'
```

Note that you _must_ return an object for the advice, which is usually `this`.

## Caveats

If your module exports a function or a constructor, then if it is required / loaded _before_ being replaced, or is otherwised referenced directly from an object by an intermediate require, then this won't work.

In particular, be aware that if you have module A that depends on module B, replacing A before replacing B means that A will not be correctly using the replaced version of B, unless A doesn't directly require and use the function you are replacing in B.

This can be resolved if you do things in the correct order, i.e. replace the child dependency function before replacing the parent. In the future, perhaps this module will have some wizardry to detect and resolve this, but I doubt it.

## References

* [Hacking Node Require][2]
* [node-mocked][3]
* [module.js source][4]

[1]: https://github.com/cujojs/meld
[2]: http://bahmutov.calepin.co/hacking-node-require.html
[3]: https://github.com/konobi/node-mocked/blob/master/lib/index.js
[4]: https://github.com/joyent/node/blob/master/lib/module.js