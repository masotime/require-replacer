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

replacer(function around(methodCall) { 
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
replacer(function around(methodCall) { ...}, './lib/test', 'worldFn');
```

## Caveats

This won't work if you require the module before replacing it.

[1]: https://github.com/cujojs/meld