# Pluto.js

_"JavaScript dependency injection that's so small, it almost doesn't count."_

| Branch        | Status        |
| ------------- |:------------- |
| Master        | [![Build Status](https://travis-ci.org/ecowden/pluto.js.png?branch=master)](https://travis-ci.org/ecowden/pluto.js) [![Coverage Status](https://coveralls.io/repos/github/ecowden/pluto.js/badge.svg?branch=master)](https://coveralls.io/github/ecowden/pluto.js?branch=master) |
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
