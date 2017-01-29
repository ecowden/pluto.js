'use strict'

const test = require('ava')

const pluto = require('./pluto')

test('bind to instance', function* (t) {
  const anInstance = {} // can be any JavaScript object
  const bind = pluto()
  bind('myInstance').toInstance(anInstance)

  // bind.get will return a Promise, since we may have asynchronous resolution to do
  bind.get('myInstance').then((myInstance) => {
    t.is(myInstance, anInstance)
  })
})

test('bind to instance, with eager loading', function* (t) {
  const anInstance = Promise.resolve('my instance object')
  const bind = pluto()
  bind('myInstance').toInstance(anInstance) // Promises will be resolved

  // bind.get will return a Promise, since we may have asynchronous resolution to
  t.is(yield bind.get('myInstance'), 'my instance object')

  // ... or eagerly load everything
  const app = yield bind.eagerlyLoadAll()

  // ...and then everything can be retrieved synchronously.
  // All factory and constructor functions will be called.
  // All Promise results will be resolved.
  t.is(app.get('myInstance'), 'my instance object')
})

test('bind to constructor', function* (t) {
  function Greeter(name) {
    this.name = name
  }

  Greeter.prototype.greet = function () {
    return `Hello, ${this.name}!`
  }

  const bind = pluto()
  bind('name').toInstance(Promise.resolve('World'))
  bind('greeter').toConstructor(Greeter)

  const theGreeter = yield bind.get('greeter')

  t.is(theGreeter.greet(), 'Hello, World!')
})

test('bind to factory function', function* (t) {
  function greeterFactory(greeting) {
    return function () {
      return greeting
    }
  }

  const bind = pluto()
  bind('greeting').toInstance('Hello, world!')
  bind('greeter').toFactory(greeterFactory)

  const theGreeter = yield bind.get('greeter')

  t.is(theGreeter(), 'Hello, world!')
})
