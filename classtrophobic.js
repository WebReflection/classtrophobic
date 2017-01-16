/*! (C) 2017 Andrea Giammarchi - MIT Style License */
const Class = ((Object, Reflect) => {'use strict';
  const
    getProp = Reflect.get,
    setProp = Reflect.set,
    ownProps = Reflect.ownKeys,
    defProp = Reflect.defineProperty,
    reConstruct = Reflect.construct,
    gPO = Object.getPrototypeOf,
    sPO = Object.setPrototypeOf,
    defProps = Object.defineProperties,
    gOPD = Object.getOwnPropertyDescriptor,
    constructorHandler = {
      apply: (p, self, args) => Reflect.apply(p.self, self, args),
      construct: (p, args, t) => reConstruct(p.self, args, t),
      defineProperty: (p, k, d) => defProp(p.self, k, d),
      deleteProperty: (p, k) => Reflect.deleteProperty(p.self, k),
      get: (p, k, r) => {
        if (k === 'super' && !('self' in p)) {
          return function () {
            return (p.self = reConstruct(p.super, arguments, p.class));
          };
        }
        const value = getProp(p.self, k);
        return typeof value === 'function' ? function () {
          return value.apply(this === r ? p.self : this, arguments);
        } : value;
      },
      getOwnPropertyDescriptor: (p, k) => gOPD(p.self, k),
      getPrototypeOf: (p) => gPO(p.self),
      has: (p, k) => Reflect.has(p.self, k),
      isExtensible: (p) => Reflect.isExtensible(p.self),
      ownKeys: (p) => ownProps(p.self),
      preventExtensions: (p) => Reflect.preventExtensions(p.self),
      set: (p, k, v) => setProp(p.self, k, v),
      setPrototypeOf: (p, v) => sPO(p.self, v)
    },
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
    staticHandler = {
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
              const target = isFunction ? function () {} : {};
              target.super = Super;
              target.class = Class;
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
      Static = Super ? {super: {get() { return new Proxy(Class, staticHandler); }}} : {},
      Prototype = Super ? {super: {get() { return new Proxy(this, superHandler); }}} : {},
      isFunction = Super ? Function.prototype.isPrototypeOf(Super) : false
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
