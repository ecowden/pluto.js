'use strict'

const test = require('ava')

const pluto = require('./pluto')

test('pluto() returns a `bind` function', function* (t) {
  const bind = pluto()
  t.is(typeof bind, 'function')
})

test('bind(name).toInstance(instance) throws if instance is null', function* (t) {
  const error = t.throws(() => {
    const bind = pluto()
    bind('$injected').toInstance(null)
  }, Error)

  t.is(error.message, "cannot bind '$injected' because the specified target is null.")
})

test('bind(name).toInstance(instance) throws if instance parameter is undefined', function* (t) {
  const error = t.throws(() => {
    const bind = pluto()
    bind('$injected').toInstance(undefined)
  }, Error)

  t.is(error.message, "cannot bind '$injected' because the specified target is undefined.")
})

test('bind(name).toInstance(instance) throws if the instance name is a duplicate', function* (t) {
  const error = t.throws(() => {
    const bind = pluto()
    bind('$injected').toInstance({})
    bind('$injected').toInstance({})
  }, Error)

  t.is(error.message, "module already contains a mapping with the name '$injected'")
})

test('after bind(name).toInstance(instance), bind.get(name) resolves to the instance', function* (t) {
  const expected = {}
  const bind = pluto()
  bind('$injected').toInstance(expected)

  const actual = yield bind.get('$injected')
  t.is(actual, expected)
})

test('bind(name).toFactory(factory) throws if factory is null', function* (t) {
  const error = t.throws(() => {
    const bind = pluto()
    bind('$injected').toFactory(null)
  }, Error)

  t.is(error.message, "cannot bind '$injected' because the specified target is null.")
})

test('bind(name).toFactory(factory) throws if factory parameter is undefined', function* (t) {
  const error = t.throws(() => {
    const bind = pluto()
    bind('$injected').toFactory(undefined)
  }, Error)

  t.is(error.message, "cannot bind '$injected' because the specified target is undefined.")
})

test('bind(name).toFactory(instance) throws if the name is a duplicate', function* (t) {
  function factory() {}
  const error = t.throws(() => {
    const bind = pluto()
    bind('$injected').toFactory(factory)
    bind('$injected').toFactory(factory)
  }, Error)

  t.is(error.message, "module already contains a mapping with the name '$injected'")
})

test('bind(name).toFactory(instance) throws if the factory is not a function', function* (t) {
  const error = t.throws(() => {
    const bind = pluto()
    bind('$injected').toFactory({})
  }, Error)

  t.is(error.message, "cannot bind '$injected' because the specified target is not a function.")
})

test('when the factory function has zero parameters, bind.get(name) returns the result of the factory\'s invocation', function* (t) {
  const expected = {}

  function factory() {
    return expected
  }

  const bind = pluto()
  bind('$injected').toFactory(factory)

  const actual = yield bind.get('$injected')
  t.is(actual, expected)
})

test('when the factory returns a Promise, resolves the promise', function* (t) {
  const expected = {}

  function factory() {
    return Promise.resolve(expected)
  }

  const bind = pluto()
  bind('$injected').toFactory(factory)

  const actual = yield bind.get('$injected')
  t.is(actual, expected)
})

test('bind.get(name) injects the factory function\'s parameters, then returns the result from the factory\'s invocation', function* (t) {
  const expectedParam = {}

  function factory($param) {
    return {
      param: $param
    }
  }

  const bind = pluto()
  bind('$root').toFactory(factory)
  bind('$param').toInstance(expectedParam)

  const actual = yield bind.get('$root')
  t.is(actual.param, expectedParam)
})

test('memoizes invocation so that the factory function is only invoked once', function* (t) {
  let invocationCount = 0

  function factory() {
    invocationCount++
    return 'dummy'
  }

  const bind = pluto()
  bind('$factory').toFactory(factory)

  yield bind.get('$factory')
  yield bind.get('$factory')

  t.is(invocationCount, 1)
})

test('bind(name).toConstructor(constructor) throws if constructor is null', function* (t) {
  const error = t.throws(() => {
    const bind = pluto()
    bind('$injected').toConstructor(null)
  }, Error)

  t.is(error.message, "cannot bind '$injected' because the specified target is null.")
})

test('bind(name).toConstructor(constructor) throws if constructor is undefined', function* (t) {
  const error = t.throws(() => {
    const bind = pluto()
    bind('$injected').toConstructor(undefined)
  }, Error)

  t.is(error.message, "cannot bind '$injected' because the specified target is undefined.")
})

test('bind(name).toConstructor(constructor) throws if the name is a duplicate', function* (t) {
  function Constructor() {}

  const error = t.throws(() => {
    const bind = pluto()
    bind('$injected').toConstructor(Constructor)
    bind('$injected').toConstructor(Constructor)
  }, Error)

  t.is(error.message, "module already contains a mapping with the name '$injected'")
})

test('bind(name).toConstructor(instance) throws if the constructor is not a function', function* (t) {
  const notAFunction = {}

  const error = t.throws(() => {
    const bind = pluto()
    bind('$injected').toConstructor(notAFunction)
  }, Error)

  t.is(error.message, "cannot bind '$injected' because the specified target is not a function.")
})

test('when a constructor has zero parameters, bind.get(name) returns the new Constructor()', function* (t) {
  const Constructor = function () {}

  const bind = pluto()
  bind('$injected').toConstructor(Constructor)

  const actual = yield bind.get('$injected')

  t.truthy(actual instanceof Constructor)
})

test('when a constructor returns a Promise, resolves the Promise', function* (t) {
  // Note that this is "incorrect" usage of a Constructor function, but
  // since it's possible, we should handle it gracefully.
  const expected = {}
  const Constructor = function () {
    return Promise.resolve(expected)
  }

  const bind = pluto()
  bind('$injected').toConstructor(Constructor)

  const actual = yield bind.get('$injected')

  t.is(actual, expected)
})

test('when a constructor has one parameter, bind.get(name) returns the new Constructor() with the parameter injected', function* (t) {
  const Root = function ($param1) {
    this.param1 = $param1
  }

  const bind = pluto()
  bind('$Root').toConstructor(Root)
  bind('$param1').toInstance('the first injected parameter')

  const actual = yield bind.get('$Root')

  t.truthy(actual instanceof Root)
  t.is(actual.param1, 'the first injected parameter')
})

test('bind.get(name) rejects if the specified name is not mapped', function* (t) {
  const bind = pluto()
  const error = yield t.throws(bind.get('totally bogus key'), Error)

  t.is(error.message, "nothing is mapped for name 'totally bogus key'")
})

test('bind.getAll([names]) accepts an array of names and returns a matching array of instances', function* (t) {
  const bind = pluto()
  bind('a').toInstance('A')
  bind('b').toInstance('B')

  const actual = yield bind.getAll(['a', 'b'])
  t.deepEqual(actual, ['A', 'B'])
})

test('bind.getAll([names]) throws if a name is unmapped', function* (t) {
  const bind = pluto()
  bind('a').toInstance('A')

  const error = yield t.throws(bind.getAll(['a', 'totally bogus key']), Error)

  t.is(error.message, "nothing is mapped for name 'totally bogus key'")
})

test('bind.eageryLoadAll executes all factory and constructor functions', function* (t) {
  let constructorCalled = false
  let factoryCalled = false

  function FakeConstructor() {
    constructorCalled = true
  }

  function fakeFactory() {
    factoryCalled = true
    return Promise.resolve('fake-factory-result')
  }

  const bind = pluto()
  bind('Constructor').toConstructor(FakeConstructor)
  bind('factory').toFactory(fakeFactory)

  const app = yield bind.eagerlyLoadAll()

  t.truthy(constructorCalled, 'constructor is called')
  t.truthy(factoryCalled, 'factory function is called')

  t.truthy(app.get('Constructor') instanceof FakeConstructor)
  t.is(app.get('factory'), 'fake-factory-result')
})
