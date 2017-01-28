'use strict'

const test = require('ava')

const pluto = require('../lib/pluto')

test('pluto.createModule( ... ) invokes the callback with a "bind" function', function* (t) {
  let actualBind

  pluto.createModule(function (bind) {
    actualBind = bind
  })

  t.is(typeof actualBind, 'function')
})

test('bind(name).toInstance(instance) throws if instance is null', function* (t) {
  const error = t.throws(() => {
    pluto.createModule(function (bind) {
      bind('$injected').toInstance(null)
    }, Error)
  })
  t.is(error.message, "cannot bind '$injected' because the specified target is null.")
})

test('bind(name).toInstance(instance) throws if instance parameter is undefined', function* (t) {
  const error = t.throws(() => {
    pluto.createModule(function (bind) {
      bind('$injected').toInstance(undefined)
    }, Error)
  })
  t.is(error.message, "cannot bind '$injected' because the specified target is undefined.")
})

test('bind(name).toInstance(instance) throws if the instance name is a duplicate', function* (t) {
  const error = t.throws(() => {
    pluto.createModule(function (bind) {
      bind('$injected').toInstance({})
      bind('$injected').toInstance({})
    }, Error)
  })
  t.is(error.message, "module already contains a mapping with the name '$injected'")
})

test('with bind(name).toInstance(instance), module.get(name) returns the instance', function* (t) {
  const expected = {}
  const module = pluto.createModule(function (bind) {
    bind('$injected').toInstance(expected)
  })

  const actual = module.get('$injected')
  t.is(actual, expected)
})
