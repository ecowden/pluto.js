# Pluto.js

_"JavaScript dependency injection that's so small, it almost doesn't count."_

| Branch        | Status        |
| ------------- |:------------- |
| Master        | [![Build Status](https://travis-ci.org/ecowden/pluto.js.png?branch=master)](https://travis-ci.org/ecowden/pluto.js) [![Coverage Status](https://coveralls.io/repos/github/ecowden/pluto.js/badge.svg?branch=master)](https://coveralls.io/github/ecowden/pluto.js?branch=master) [![NSP Status](https://nodesecurity.io/orgs/ecowden/projects/ef2a53ca-7e86-47ac-8ed2-9faa50163fa0/badge)](https://nodesecurity.io/orgs/ecowden/projects/ef2a53ca-7e86-47ac-8ed2-9faa50163fa0) |
| All           | [![Build Status](https://travis-ci.org/ecowden/pluto.js.png)](https://travis-ci.org/ecowden/pluto.js) |

## What is Pluto?

Pluto is a JavaScript dependency injection tool.

Dependency injection is a spiffy way to assemble your applications. It decouples the various bits and makes your app testable. An introduction to dependency injection principles is currently beyond the scope of this guide.

## Installing Pluto

Pluto is designed to be used with [Node](http://nodejs.org/) and [NPM](http://npmjs.org/). From the root of a Node
project, execute:

```
$ npm install pluto --save
```

## How to Pluto?

A binder is the basic unit of Pluto's dependency injection. It maps names to objects you want.

Pluto's injection is done in a few steps:

1. Create bindings. When you do this, you bind names to any combination of objects, factory functions and constructor functions.
2. Optionally, call `.get(...)`. Pluto will give you the thing mapped to that name. Along the way, it will inject parameters that match other names bound in the binder and resolve Promises as appropriate.
3. Alternately, call `.bootstrap()` to run all your factory functions and constructors, and resolve all promises. This is handy if you're trying to start up an application with a bunch of moving parts, and more common than using `.get(...)` for each part individually.

There are three things you can bind to a name: an object instance, a constructor function and a factory function.

### Promises

If you pass Pluto a promise, it will resolve it. If your factory or constructor function returns a promise, Pluto will resolve it before injecting the result into other components.

### Instance Binding

The simplest binding is to bind a name to an instance:

```  js
const anInstance = {} // can be any JavaScript object, or a Promise
const bind = pluto()
bind('myInstance').toInstance(anInstance)

// bind.get(...) gives us a Promise that resolves to our instance
bind.get('myInstance').then((myInstance) => {
  t.is(myInstance, anInstance)
})
```

### Constructor Binding

You can also bind to a constructor function (i.e., a function that is meant to be used with the `new` keyword to create a new object). When you call `.get(...)`, Pluto will invoke the Constructor using `new` and return the result. If the constructor has any parameters, Pluto will consult its bindings and pass them into the constructor:

```js
function Greeter(greeting, name) {
  this.greeting = greeting
  this.name = name
}

Greeter.prototype.greet = function () {
  return `${this.greeting}, ${this.name}!`
}

const bind = pluto()
bind('greeting').toInstance('Hello')
bind('name').toInstance(Promise.resolve('World')) // A promise will work, too
bind('greeter').toConstructor(Greeter)

bind.get('greeter').then((myGreeter) => {
  t.is(myGreeter.greet(), 'Hello, World!')
})
```

### Factory Function Binding

Similarly, you can bind to a factory function -- that is, a function that creates some other object. When you call `.get(...)`, Pluto will invoke the function and return the result. Just like with a constructor, if the factory function has any parameters, Pluto will consult its bindings and pass them into the factory:

```js
function greeterFactory(greeting, name) {
  return function greet() {
    return `${greeting}, ${name}!`
  }
}

const bind = pluto()
bind('greeting').toInstance('Hello')
bind('name').toInstance(Promise.resolve('World')) // A promise will work, too
bind('greet').toFactory(greeterFactory)

bind.get('greet').then((greet) => {
  t.is(greet(), 'Hello, World!')
})
```

**Author's note**: _Factory functions a super useful. I find that I use them more than any other type of binding._

### Eager Bootstrapping

By default, Pluto will only create your objects lazily. That is, factory and constructor functions will only get called when you ask for them with `.get(...)`.

You may instead want them to be eagerly invoked to bootstrap your project. For instance, you may have factory functions which set up Express routes or which perform other application setup.

Invoke `.bootstrap()` after creating your bindings to eagerly bootstrap your application. The result is a promise which resolves to a `Map` holding all bindings by name, fully resolved and injected.

```js
function greeterFactory(greeting, name) {
  return function greet() {
    return `${greeting}, ${name}!`
  }
}

const bind = pluto()
bind('greeting').toInstance('Hello')
bind('name').toInstance(Promise.resolve('World')) // A promise will work, too
bind('greet').toFactory(greeterFactory)

bind.bootstrap().then(app => {
  const greet = app.get('greet') // Note: it's synchronous. Everything is ready.
  t.is(greet(), 'Hello, World!')
})
```

### Injected Objects are Singletons

Note that a factory function or constructor function is only called once. Each call to `get(...)` will return the same instance.

Remember that singletons are only singletons within a single binder, though. Different binders -- for instance, created for separate test methods -- will each have their own singleton instance.

## Inspect Dependency Graph

Pluto.js tracks how components are injected to help diagnose issues and aid in application discovery. The full injection graph is available for injection under the key, `plutoGraph`.

Taking out Greeter example:

```js
function greetFactory(greeting) {
  return function greet() {
    return `${greeting}, World!`
  }
}

class Greeter {
  constructor(greet) {
    this.greet = greet
  }
}

const bind = pluto()
bind('greeting').toInstance('Hello')
bind('greet').toFactory(greetFactory)
bind('greeter').toConstructor(Greeter)

// Bootstrap application
const app = yield bind.bootstrap()

// Retrieve the graph. Note that this can also be injected
// into a component directly!
const graph = app.get('plutoGraph')
```

### `Graph` Object

The `Graph` class has the following relevant methods:

**.nodes**

An `Array` of all `GraphNode`s.

**.getNode(name)**

Returns the `GraphNode` with the given name.

### `GraphNode` Object

The `GraphNode` class has the following relevant methods:

**.name**

The string name used to bind the component.

**.bindingStrategy**

The strategy used to bind the component for injection. One of `instance`, `factory`, or `constructor`.

**.parents**

A `Map` of parent nodes, with names used for keys and `GraphNode` objects for values.

**.children**

A `Map` of child nodes, with names used for keys and `GraphNode` objects for values.

**.isBuiltIn**

Returns true if the node is built in to Pluto.js, like the `plutoBinder`, `plutoApp`, or `plutoGraph` itself.

### JSON Representation

The graph, when converted to JSON, will be represented as a flattened `Array` of `GraphNodes`, like:

```json
[
  {
    "name": "plutoGraph",
    "parents": [],
    "children": [],
    "bindingStrategy": "instance",
    "isBuiltIn": true
  },
  {
    "name": "plutoBinder",
    "parents": [],
    "children": [],
    "bindingStrategy": "instance",
    "isBuiltIn": true
  },
  {
    "name": "greeting",
    "parents": [
      "greet"
    ],
    "children": [],
    "bindingStrategy": "instance",
    "isBuiltIn": false
  },
  {
    "name": "greet",
    "parents": [
      "greeter"
    ],
    "children": [
      "greeting"
    ],
    "bindingStrategy": "factory",
    "isBuiltIn": false
  },
  {
    "name": "greeter",
    "parents": [],
    "children": [
      "greet"
    ],
    "bindingStrategy": "constructor",
    "isBuiltIn": false
  },
  {
    "name": "plutoApp",
    "parents": [],
    "children": [],
    "bindingStrategy": "instance",
    "isBuiltIn": true
  }
]
```

## Self injection

There are times when you might not know exactly what you'll need until later in runtime, and when you might want to manage injection dynamically. Pluto can inject itself to give you extra control.

There are two ways to inject Pluto. Use `plutoBinder` if you want the raw binder. Use `plutoApp` when you want the fully bootstapped, synchronous app.

### plutoBinder

The most direct -- and safe! -- way to self-inject Pluto is to ask for `plutoBinder`. This will inject the same `bind` function that you received when invoking `pluto()`.

```js
function fakeFactory(plutoBinder) {
  return plutoBinder.get('data') // will return a promise
}

const bind = pluto() // `bind` is the same object as `plutoBinder`, above
bind('data').toInstance('test-data')
bind('factory').toFactory(fakeFactory)

const actual = yield bind.get('factory')
t.is(actual, 'test-data')
```

Note that the `get(...)` and `getAll(...)` functions are asynchronous and return a `Promise`!

### plutoApp

When using Pluto's bootstrapping capability, you can self-inject the fully bootstrapped application under the name `plutoApp`:

```js
class Greeter {
  constructor(plutoApp) {
    // Note: the plutoApp Map may not be fully populated yet, since we could
    // be at any indeterminate part of the bootstrapping process.
    // Save it for later, but don't go using it yet.
    this._plutoApp = plutoApp
  }

  greet() {
    // By now, the app is fully bootstrapped and the plutoApp Map is safe
    // to use.
    const greeting = this._plutoApp.get('greeting')
    return `${greeting}, World!`
  }
}

const bind = pluto()
bind('greeting').toInstance('Bonjour')
bind('greeter').toConstructor(Greeter)

const app = yield bind.bootstrap()

const greeter = app.get('greeter')
const actual = greeter.greet()
t.is(actual, 'Bonjour, World!')
```

**Warning!!!***

Under normal usage, this is pretty safe. There are a few corner cases to watch out for, however!

1. **You _must_ call `.bootstrap()`!** If not, or if you try to get an instance before bootstrapping, the `plutoApp` variable will not be defined.
1. **Save it for later.** The sequence in which components are instantiated during the bootstrapping process is indeterminate. While the `plutoApp` variable is guaranteed to exist, it may not be fully populated until bootstrapping is completed. It will be safe to use during "normal" operation, however. _Note: It would be easy to add a Promise that resolves when bootstrapping is complete. If you need this feature, ask for it!_
