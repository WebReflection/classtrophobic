const console = require('consolemd');
const Class = require('./classtrophobic');
let obj;

console.log('# Classtrophobic Test');

console.log('BasicClass');
const BasicClass = Class({});
console.assert(new BasicClass instanceof BasicClass);



console.log('AttributeClass');
const AttributeClass = Class({
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
});
obj = new AttributeClass('class', 'trophobia');
console.assert(obj instanceof AttributeClass);
console.assert(obj.key === 'class');
console.assert(obj.value === 'trophobia');



console.log('Stringable');
const Stringable = Class({
  extends: AttributeClass,
  toString() {
    return `${this.key}=${this.value}`;
  }
});
console.assert(new Stringable('k', 'v').toString() === 'k=v');



console.log('BasicSubclass');
const BasicSubclass = Class({
  extends: Array
});

console.assert(new BasicSubclass instanceof Array);
console.assert(new BasicSubclass instanceof BasicSubclass);
obj = new BasicSubclass(5);
console.assert(obj.length === 5);
obj = new BasicSubclass('a', 'b', 'c');
console.assert(obj.length === 3);
console.assert(obj.join('-') === 'a-b-c');
console.assert(obj.slice(0) instanceof BasicSubclass);



console.log('BetterSubclass');
const BetterSubclass = Class({
  extends: Array,
  constructor(...args) {
    this.super().push(...args);
  }
});

console.assert(new BetterSubclass instanceof Array);
console.assert(new BetterSubclass instanceof Array);
obj = new BetterSubclass(5);
console.assert(obj.length === 1);
console.assert(obj[0] === 5);
obj = new BetterSubclass('a', 'b', 'c');
console.assert(obj.length === 3);
console.assert(obj.join('-') === 'a-b-c');



console.log('ComplexSubclass');
const ComplexSubclass = Class({
  extends: Array,
  constructor(...args) {
    this.super().push(...args);
  },
  push(...args) {
    this.super.push(...args);
    return this;
  }
});

obj = new ComplexSubclass(1);
console.assert(obj.push(2).join('-') === '1-2');


const DiffSuper = Class({
  extends: Array,
  push(...args) {
    this.super.push(...args);
    return this;
  },
  _push(...args) {
    return this.super.push(...args);
  }
});
console.log('DiffSuper');
obj = new DiffSuper(0, 1);
console.assert(obj._push(2) === 3);



console.log('HoledSuper');
obj = [];
const A = Class({
  method() { obj.push('a'); },
  holed() { obj.push('ha'); }
});
const B = Class({
  extends: A,
  method() {
    this.super.method();
    obj.push('b');
  }
});
const C = Class({
  extends: B,
  method() {
    this.super.method();
    obj.push('c');
  },
  holed() {
    this.super.holed();
    obj.push('hc');
  }
});
const D = Class({
  extends: C,
  method() {
    this.super.method();
    obj.push('d');
  },
  holed() {
    this.super.holed();
    obj.push('hd');
  }
});
const E = Class({
  extends: D,
  method() {
    this.super.method();
    obj.push('e');
  }
});

(new E).method();
console.assert(obj.splice(0, obj.length).join('-') === 'a-b-c-d-e');
(new E).holed();
console.assert(obj.splice(0, obj.length).join('-') === 'ha-hc-hd');
(new D).holed();
console.assert(obj.splice(0, obj.length).join('-') === 'ha-hc-hd');



console.log('Constructor.super()');
const A2 = Class({
  constructor() {
    obj.push('A2');
  }
});
const B2 = Class({
  extends: A2,
  constructor() {
    this.super();
    obj.push('B2');
  }
});
const C2 = Class({
  extends: B2,
  constructor() {
    this.super();
    obj.push('C2');
  }
});
(new C2);
console.assert(obj.splice(0, obj.length).join('-') === 'A2-B2-C2');



console.log('static.method()');
const AS2 = Class({
  static: {
    method() {
      obj.push('AS2');
    }
  }
});
const BS2 = Class({
  extends: AS2,
  static: {
    method() {
      this.super.method();
      obj.push('BS2');
    }
  }
});
const CS2 = Class({
  extends: BS2,
  static: {
    method() {
      this.super.method();
      obj.push('CS2');
    }
  }
});
CS2.method();
console.assert(obj.splice(0, obj.length).join('-') === 'AS2-BS2-CS2');



console.log('static.holes()');
const AS3 = Class({
  static: {
    method() {
      obj.push('AS3');
    }
  }
});
const BS3 = Class({
  extends: AS3
});
const CS3 = Class({
  extends: BS3,
  static: {
    method() {
      this.super.method();
      obj.push('CS3');
    }
  }
});
const DS3 = Class({
  extends: CS3,
  static: {
    method() {
      this.super.method();
      obj.push('DS3');
    }
  }
});
const ES3 = Class({
  extends: DS3
});
ES3.method();
console.assert(obj.splice(0, obj.length).join('-') === 'AS3-CS3-DS3');



console.log('#green(*✔* OK)');
console.log('');
