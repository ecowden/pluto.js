'use strict'

const test = require('ava')

const pluto = require('./pluto')

test('bind to instance', function* (t) {
  const anInstance = {} // can be any JavaScript object
  const module = pluto.createModule(function (bind) {
    bind('myInstance').toInstance(anInstance)
  })

  t.is(module.get('myInstance'), anInstance)
})

test('bind to constructor', function* (t) {
  function Greeter(greeting) {
    this.greeting = greeting
  }

  Greeter.prototype.greet = function () {
    return this.greeting
  }

  const module = pluto.createModule(function (bind) {
    bind('greeting').toInstance('Hello, world!')
    bind('greeter').toConstructor(Greeter)
  })

  const theGreeter = module.get('greeter')

  t.is(theGreeter.greet(), 'Hello, world!')
})

test('bind to factory function', function* (t) {
  function greeterFactory(greeting) {
    return function () {
      return greeting
    }
  }

  const module = pluto.createModule(function (bind) {
    bind('greeting').toInstance('Hello, world!')
    bind('greeter').toFactory(greeterFactory)
  })

  const theGreeter = module.get('greeter')

  t.is(theGreeter(), 'Hello, world!')
})
