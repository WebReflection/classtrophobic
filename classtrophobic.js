const Class = ((Object, Reflect) => {'use strict';
  /*! (C) 2017 Andrea Giammarchi - MIT Style License */
  const
    // trapped shortcuts (to speed up reference access + help minifier)
    hasProp = Reflect.has,
    getProp = Reflect.get,
    setProp = Reflect.set,
    ownProps = Reflect.ownKeys,
    delProp = Reflect.deleteProperty,
    defProp = Reflect.defineProperty,
    reConstruct = Reflect.construct,
    gPO = Object.getPrototypeOf,
    sPO = Object.setPrototypeOf,
    defProps = Object.defineProperties,
    gOPD = Object.getOwnPropertyDescriptor,
    // used to Proxy constructor for this.super() call
    constructorHandler = {
      isExtensible: (p) => Reflect.isExtensible(p.self),
      preventExtensions: (p) => Reflect.preventExtensions(p.self),
      getPrototypeOf: (p) => gPO(p.self),
      setPrototypeOf: (p, v) => sPO(p.self, v),
      getOwnPropertyDescriptor: (p, k) => gOPD(p.self, k),
      has: (p, k) => hasProp(p.self, k),
      get: (p, k, r) => {
        // this.super(); is required top level of a constructor
        if (k === 'super' && !('self' in p)) {
          return function () {
            return (p.self = reConstruct(p.super, arguments, p.class));
          };
        }
        // in other cases we need to remove the Proxy from the method invoke
        const value = getProp(p.self, k);
        return typeof value === 'function' ? function () {
          return value.apply(this === r ? p.self : this, arguments);
        } : value;
      },
      set: (p, k, v) => setProp(p.self, k, v),
      deleteProperty: (p, k) => delProp(p.self, k),
      defineProperty: (p, k, d) => defProp(p.self, k, d),
      ownKeys: (p) => ownProps(p.self),
      apply: (p, self, args) => Reflect.apply(p.self, self, args),
      construct: (p, args, t) => reConstruct(p.self, args, t)
    },
    // used to Proxy any other this.super.method() call
    superHandler = {
      get: (self, prop, receiver) => function () {
        const proto = gPO(self), method = proto[prop];
        let result, parent = proto;
        do { parent = gPO(parent); }
        while ((method === parent[prop]));
        try { result = parent[prop].apply(sPO(self, parent), arguments); }
        finally { sPO(self, proto); }
        return result;
      }
    },
    staticHandler = { // so similar, yet so different!
      get: (self, prop, receiver) => function () {
        const proto = gPO(self), method = self[prop];
        let result, parent = proto;
        while ((method === parent[prop])) parent = gPO(parent);
        self.method = parent[prop];
        try { result = self.method.apply(sPO(self, gPO(parent)), arguments); }
        finally { sPO(self, proto).method = method; }
        return result;
      }
    },
    // properties reserved for class definition purpose
    reserved = new Set(['constructor', 'extends', 'static'])
  ;
  return function Classtrophobic(definition) {
    const
      Constructor = definition.constructor,
      Statics = definition.static,
      Super = definition.extends,
      Class = definition.hasOwnProperty('constructor') ?
        (Super ?
          class extends Super {
            constructor() {
              const target = {super: Super, class: Class};
              return Constructor.apply(
                new Proxy(target, constructorHandler),
                arguments
              ) || target.self;
            }
          } :
          class {
            constructor() {
              return Constructor.apply(this, arguments) || this;
            }
          }) :
        (Super ? class extends Super {} : class {}),
      Static = {super: {get() { return new Proxy(Class, staticHandler); }}},
      Prototype = {super: {get() { return new Proxy(this, superHandler); }}}
    ;
    ownProps(definition)
      .filter((key) => !reserved.has(key))
      .forEach((key) => {
        Prototype[key] = gOPD(definition, key);
        Prototype[key].enumerable = false;
      });
    defProps(Class.prototype, Prototype);
    if (Statics) ownProps(Statics).forEach((key) => {
      Static[key] = gOPD(Statics, key);
      Static[key].enumerable = false;
    });
    return defProps(Class, Static);
  };
})(Object, Reflect);
try { module.exports = Class; } catch(o_O) {}
