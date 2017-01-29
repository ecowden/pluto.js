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

test('bind to constructor', function* (t) {
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
})

test('bind to factory function', function* (t) {
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
})

test('bootstrapping', function* (t) {
  function greeterFactory(greeting, name) {
    return function greet() {
      return `${greeting}, ${name}!`
    }
  }

  const bind = pluto()
  bind('greeting').toInstance('Hello')
  bind('name').toInstance(Promise.resolve('World'))
  bind('greet').toFactory(greeterFactory)

  bind.bootstrap().then(app => {
    const greet = app.get('greet') // Note: it's synchronous. Everything is ready.
    t.is(greet(), 'Hello, World!')
  })
})
