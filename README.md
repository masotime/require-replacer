# require-replacer

Replaces the function of a `require` (or property of the exports of a `require`) with an "around advice" via [meld][1].

## Usage

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

require('./lib/test')(); // 'Helo world'
```

or if you export an object instead

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

If your module exports a constructor, then you may write an interceptor in the following manner e.g:

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
```

Note that you _must_ return an object for the advice, which is usually `this`.

## Caveats

This won't work if you require the module before replacing it.

[1]: https://github.com/cujojs/meld