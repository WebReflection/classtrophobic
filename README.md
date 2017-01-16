# Classtrophobic [![build status](https://secure.travis-ci.org/WebReflection/classtrophobic.svg)](http://travis-ci.org/WebReflection/classtrophobic) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/classtrophobic/badge.svg?branch=master)](https://coveralls.io/github/WebReflection/classtrophobic?branch=master)

Zero Runtime, Babel Proof, Classes.

```js
const Class = require('classtrophobic');

const List = Class({
  extends: Array,         // class extends Array {}
  constructor(...args) {  // super();
    this.super();
    this.push(...args);
  },
  push(...args) {         // super.push(...args);
    this.super.push(...args);
    return this;
  }
});
```

### Don't Miss [The Related Post](https://medium.com/@WebReflection/a-case-for-js-classes-without-classes-9e60b3b5992#.oh0mweilj)
If you want to know more about this project use cases, and also why it was born in the first place,
[read the story in Medium](https://medium.com/@WebReflection/a-case-for-js-classes-without-classes-9e60b3b5992#.oh0mweilj).


### Classtrophobic on ES5
Using some extra runtime, avoiding the usage of `class` and `Proxy`,
[Classtrophobic for ES5](https://github.com/WebReflection/classtrophobic-es5) works for all Mobile browsers, and IE11+ for Desktop.


### Which Version For My Targets?

You can test live both [classtrophobic](https://webreflection.github.io/classtrophobic/test.html) and [classtrophobic-es5](https://webreflection.github.io/classtrophobic-es5/test.html).
If the page turns out green, you're good to go!

The main difference is that ES5 version has a greedy runtime when it comes to `super` usage,
while this original version uses real classes and delegate to Proxy access the `super` resolution,
working only when a method is accessed and per single method, as opposite of runtime setup for all methods in the es5 case.

<sup><sub>Luckily overrides are not the most frequent thing ever.</sub></sup>


### Ready for Refactory
Semantics used in native ES6 classes are equivalent in Classtrophobic.

```js
// Native Class
class PushChainable extends Array {
  static size(arr) {
    return arr.length;
  }
  constructor(...args) {
    super().push(...args);
  }
  push(...args) {
    super.push(...args);
    return this;
  }
}

// Classtrophobic
const PushChainable = Class({
  extends: Array,
  static: {size:(arr) => arr.length},
  constructor(...args) {
    this.super().push(...args);
  },
  push(...args) {
    this.super.push(...args);
    return this;
  }
});
```

Feel free to compare transpiled output for both [native](http://babeljs.io/repl/#?babili=false&evaluate=true&lineWrap=false&presets=es2015&experimental=false&loose=false&spec=false&code=class%20PushChainable%20extends%20Array%20%7B%0A%20%20static%20size(arr)%20%7B%0A%20%20%20%20return%20arr.length%3B%0A%20%20%7D%0A%20%20constructor(...args)%20%7B%0A%20%20%20%20super().push(...args)%3B%0A%20%20%7D%0A%20%20push(...args)%20%7B%0A%20%20%20%20super.push(...args)%3B%0A%20%20%20%20return%20this%3B%0A%20%20%7D%0A%7D&playground=true) and [classtrophobic](http://babeljs.io/repl/#?babili=false&evaluate=true&lineWrap=false&presets=es2015&experimental=false&loose=false&spec=false&code=const%20PushChainable%20%3D%20Class(%7B%0A%20%20extends%3A%20Array%2C%0A%20%20static%3A%20%7Bsize%3A(arr)%20%3D%3E%20arr.length%7D%2C%0A%20%20constructor(...args)%20%7B%0A%20%20%20%20this.super().push(...args)%3B%0A%20%20%7D%2C%0A%20%20push(...args)%20%7B%0A%20%20%20%20this.super.push(...args)%3B%0A%20%20%20%20return%20this%3B%0A%20%20%7D%0A%7D)%3B&playground=true), considering each method that will use `super`, in the transpiled case, will be polluted with similar logic, inevitably increasing the final project size to deliver.

With Classtrophobic, the total amount of extra needed bytes is around 800 [minified](classtrophobic.min.js) and gzipped.
That's going to be the only extra code that will ever be needed to execute your classes,
which is represented by [100 well indented LOC](classtrophobic.js) in total.



## What Does Classtrophobic That Others Don't?
To start with, it uses native `class`, because there's more than just prototypal inheritance in ES2015 classes.
As example, if you subclass an `Array` with good old JS, you'll lose your class as soon as you'll call a method.

```js
function List() {}
Object.setPrototypeOf(List, Array);
Object.setPrototypeOf(List.prototype, Array.prototype);

(new List).slice() instanceof List; // ⚠️️ false

// even defining Symbol.species at runtime
Object.defineProperty(List, Symbol.species, {get:()=>List});

(new List).slice() instanceof List; // ⚠️️ still false
```

So while [es-class](https://github.com/WebReflection/es-class) and similar libraries can grant support for very old browsers,
Classtrophobic needs no transpilation at its core and requires browsers natively compatible with classes.

In order to have a robust and fast `super` mechanism that perfectly simulate its native counter part,
Classtrophobic also needs an engine that is compatible with [Proxy](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

Don't worry though, if you don't need `super` access, your code would run without needing a Proxy at all.



## Compatibility

If your engine is compatible with [ES2015 class](http://caniuse.com/#feat=es6-class), you can already use this tiny library.
However, if your code needs `super` calls, be sure [ES2015 Proxy](http://caniuse.com/#feat=proxy) is available too.



## License

```
Copyright (C) 2017 by Andrea Giammarchi - @WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
