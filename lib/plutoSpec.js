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

test('after bind(name).toInstance(instance), module.get(name) returns the instance', function* (t) {
  const expected = {}
  const module = pluto.createModule(function (bind) {
    bind('$injected').toInstance(expected)
  })

  const actual = module.get('$injected')
  t.is(actual, expected)
})

test('bind(name).toFactory(instance) throws if instance is null', function* (t) {
  const error = t.throws(() => {
    pluto.createModule(function (bind) {
      bind('$injected').toFactory(null)
    }, Error)
  })
  t.is(error.message, "cannot bind '$injected' because the specified target is null.")
})

test('bind(name).toFactory(instance) throws if instance parameter is undefined', function* (t) {
  const error = t.throws(() => {
    pluto.createModule(function (bind) {
      bind('$injected').toFactory(undefined)
    }, Error)
  })
  t.is(error.message, "cannot bind '$injected' because the specified target is undefined.")
})

test('bind(name).toFactory(instance) throws if the instance name is a duplicate', function* (t) {
  function factory() {}
  const error = t.throws(() => {
    pluto.createModule(function (bind) {
      bind('$injected').toFactory(factory)
      bind('$injected').toFactory(factory)
    }, Error)
  })
  t.is(error.message, "module already contains a mapping with the name '$injected'")
})

test('bind(name).toFactory(instance) throws if the factory is not a function', function* (t) {
  const error = t.throws(() => {
    pluto.createModule(function (bind) {
      bind('$injected').toFactory({})
    }, Error)
  })
  t.is(error.message, "cannot bind '$injected' because the specified target is not a function.")
})

test('when the factory function has zero parameters, module.get(name) returns the result of the factory\'s invocation', function* (t) {
  const expected = {}

  function factory() {
    return expected
  }

  const module = pluto.createModule(function (bind) {
    bind('$injected').toFactory(factory)
  })

  const actual = module.get('$injected')
  t.is(actual, expected)
})

test('module.get(name) injects the factory function\'s parameters, then returns the result from the factory\'s invocation', function* (t) {
  const expectedParam = {}

  function factory($param) {
    return {
      param: $param
    }
  }

  const module = pluto.createModule(function (bind) {
    bind('$root').toFactory(factory)
    bind('$param').toInstance(expectedParam)
  })

  const actual = module.get('$root')
  t.is(actual.param, expectedParam)
})

test('memoizes invocation so that the factory function is only invoked once', function* (t) {
  let invocationCount = 0

  function factory() {
    invocationCount++
    return 'dummy'
  }

  const module = pluto.createModule(function (bind) {
    bind('$factory').toFactory(factory)
  })

  module.get('$factory')
  module.get('$factory')

  t.is(invocationCount, 1)
})
