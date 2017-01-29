'use strict'

const test = require('ava')

const pluto = require('./pluto')

test('bind to instance', function* (t) {
  const anInstance = {} // can be any JavaScript object
  const bind = pluto()
  bind('myInstance').toInstance(anInstance)

  // bind.get will return a Promise, since we may have asynchronous resolution to do
  t.is(yield bind.get('myInstance'), anInstance)
})

test.skip('bind to instance, with bundle', function* (t) {
  const anInstance = Promise.resolve({}) // Promises will be resolved
  const bind = pluto()
  bind('myInstance').toInstance(anInstance)

  // bind.get will return a Promise, since we may have asynchronous resolution to
  t.is(yield bind.get('myInstance'), anInstance)

  // ... or eagerly load everything
  const app = bind.eagerlyLoadAll()

  // ...and then everything can be retrieved synchronously
  t.is(app.get('myInstance'), anInstance)
})

test('bind to constructor', function* (t) {
  function Greeter(greeting) {
    this.greeting = greeting
  }

  Greeter.prototype.greet = function () {
    return this.greeting
  }

  const bind = pluto()
  bind('greeting').toInstance('Hello, world!')
  bind('greeter').toConstructor(Greeter)

  const theGreeter = yield bind.get('greeter')

  t.is(theGreeter.greet(), 'Hello, world!')
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
