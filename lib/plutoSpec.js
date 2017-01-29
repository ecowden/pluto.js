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

test('after bind(name).toInstance(instance), module.get(name) returns the instance', function* (t) {
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

test('when the factory function has zero parameters, module.get(name) returns the result of the factory\'s invocation', function* (t) {
  const expected = {}

  function factory() {
    return expected
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

test('when a constructor has two parameters, bind.get(name) returns the new Constructor() with the parameters injected', function* (t) {
  const Root = function ($param1, $param2) {
    this.param1 = $param1
    this.param2 = $param2
  }

  const bind = pluto()
  bind('$Root').toConstructor(Root)
  bind('$param1').toInstance('the first injected parameter')
  bind('$param2').toInstance('the second injected parameter')

  const actual = yield bind.get('$Root')

  t.truthy(actual instanceof Root)
  t.is(actual.param1, 'the first injected parameter')
  t.is(actual.param2, 'the second injected parameter')
})

test('when a constructor has three parameters, bind.get(name) returns the new Constructor() with the parameters injected', function* (t) {
  const Root = function ($param1, $param2, $param3) {
    this.param1 = $param1
    this.param2 = $param2
    this.param3 = $param3
  }

  const bind = pluto()
  bind('$Root').toConstructor(Root)
  bind('$param1').toInstance('the first injected parameter')
  bind('$param2').toInstance('the second injected parameter')
  bind('$param3').toInstance('the third injected parameter')

  const actual = yield bind.get('$Root')

  t.truthy(actual instanceof Root)
  t.is(actual.param1, 'the first injected parameter')
  t.is(actual.param2, 'the second injected parameter')
  t.is(actual.param3, 'the third injected parameter')
})

test('when a constructor has four parameters, module.get(name) returns the new Constructor() with the parameters injected', function* (t) {
  const Root = function ($param1, $param2, $param3, $param4) {
    this.param1 = $param1
    this.param2 = $param2
    this.param3 = $param3
    this.param4 = $param4
  }

  const bind = pluto()
  bind('$Root').toConstructor(Root)
  bind('$param1').toInstance('the first injected parameter')
  bind('$param2').toInstance('the second injected parameter')
  bind('$param3').toInstance('the third injected parameter')
  bind('$param4').toInstance('the fourth injected parameter')

  const actual = yield bind.get('$Root')

  t.truthy(actual instanceof Root)
  t.is(actual.param1, 'the first injected parameter')
  t.is(actual.param2, 'the second injected parameter')
  t.is(actual.param3, 'the third injected parameter')
  t.is(actual.param4, 'the fourth injected parameter')
})

test('when a constructor has five parameters, module.get(name) returns the new Constructor() with the parameters injected', function* (t) {
  const Root = function ($param1, $param2, $param3, $param4, $param5) {
    this.param1 = $param1
    this.param2 = $param2
    this.param3 = $param3
    this.param4 = $param4
    this.param5 = $param5
  }

  const bind = pluto()
  bind('$Root').toConstructor(Root)
  bind('$param1').toInstance('the first injected parameter')
  bind('$param2').toInstance('the second injected parameter')
  bind('$param3').toInstance('the third injected parameter')
  bind('$param4').toInstance('the fourth injected parameter')
  bind('$param5').toInstance('the fifth injected parameter')

  const actual = yield bind.get('$Root')

  t.truthy(actual instanceof Root)
  t.is(actual.param1, 'the first injected parameter')
  t.is(actual.param2, 'the second injected parameter')
  t.is(actual.param3, 'the third injected parameter')
  t.is(actual.param4, 'the fourth injected parameter')
  t.is(actual.param5, 'the fifth injected parameter')
})

test('when a constructor has six parameters, module.get(name) returns the new Constructor() with the parameters injected', function* (t) {
  const Root = function ($param1, $param2, $param3, $param4, $param5, $param6) {
    this.param1 = $param1
    this.param2 = $param2
    this.param3 = $param3
    this.param4 = $param4
    this.param5 = $param5
    this.param6 = $param6
  }

  const bind = pluto()
  bind('$Root').toConstructor(Root)
  bind('$param1').toInstance('the first injected parameter')
  bind('$param2').toInstance('the second injected parameter')
  bind('$param3').toInstance('the third injected parameter')
  bind('$param4').toInstance('the fourth injected parameter')
  bind('$param5').toInstance('the fifth injected parameter')
  bind('$param6').toInstance('the sixth injected parameter')

  const actual = yield bind.get('$Root')

  t.truthy(actual instanceof Root)
  t.is(actual.param1, 'the first injected parameter')
  t.is(actual.param2, 'the second injected parameter')
  t.is(actual.param3, 'the third injected parameter')
  t.is(actual.param4, 'the fourth injected parameter')
  t.is(actual.param5, 'the fifth injected parameter')
  t.is(actual.param6, 'the sixth injected parameter')
})

test('when a constructor has seven parameters, module.get(name) returns the new Constructor() with the parameters injected', function* (t) {
  const Root = function ($param1, $param2, $param3, $param4, $param5, $param6, $param7) {
    this.param1 = $param1
    this.param2 = $param2
    this.param3 = $param3
    this.param4 = $param4
    this.param5 = $param5
    this.param6 = $param6
    this.param7 = $param7
  }

  const bind = pluto()
  bind('$Root').toConstructor(Root)
  bind('$param1').toInstance('the first injected parameter')
  bind('$param2').toInstance('the second injected parameter')
  bind('$param3').toInstance('the third injected parameter')
  bind('$param4').toInstance('the fourth injected parameter')
  bind('$param5').toInstance('the fifth injected parameter')
  bind('$param6').toInstance('the sixth injected parameter')
  bind('$param7').toInstance('the seventh injected parameter')

  const actual = yield bind.get('$Root')

  t.truthy(actual instanceof Root)
  t.is(actual.param1, 'the first injected parameter')
  t.is(actual.param2, 'the second injected parameter')
  t.is(actual.param3, 'the third injected parameter')
  t.is(actual.param4, 'the fourth injected parameter')
  t.is(actual.param5, 'the fifth injected parameter')
  t.is(actual.param6, 'the sixth injected parameter')
  t.is(actual.param7, 'the seventh injected parameter')
})

test('when a constructor has eight parameters, module.get(name) returns the new Constructor() with the parameters injected', function* (t) {
  const Root = function ($param1, $param2, $param3, $param4, $param5, $param6, $param7, $param8) {
    this.param1 = $param1
    this.param2 = $param2
    this.param3 = $param3
    this.param4 = $param4
    this.param5 = $param5
    this.param6 = $param6
    this.param7 = $param7
    this.param8 = $param8
  }

  const bind = pluto()
  bind('$Root').toConstructor(Root)
  bind('$param1').toInstance('the first injected parameter')
  bind('$param2').toInstance('the second injected parameter')
  bind('$param3').toInstance('the third injected parameter')
  bind('$param4').toInstance('the fourth injected parameter')
  bind('$param5').toInstance('the fifth injected parameter')
  bind('$param6').toInstance('the sixth injected parameter')
  bind('$param7').toInstance('the seventh injected parameter')
  bind('$param8').toInstance('the eighth injected parameter')

  const actual = yield bind.get('$Root')

  t.truthy(actual instanceof Root)
  t.is(actual.param1, 'the first injected parameter')
  t.is(actual.param2, 'the second injected parameter')
  t.is(actual.param3, 'the third injected parameter')
  t.is(actual.param4, 'the fourth injected parameter')
  t.is(actual.param5, 'the fifth injected parameter')
  t.is(actual.param6, 'the sixth injected parameter')
  t.is(actual.param7, 'the seventh injected parameter')
  t.is(actual.param8, 'the eighth injected parameter')
})

test('when a constructor has nine parameters, module.get(name) throws an exception', function* (t) {
  // TODO: this is an issue that should be easy to work around nowadays
  const Root = function ($param1, $param2, $param3, $param4, $param5, $param6, $param7, $param8, $param9) {}

  const bind = pluto()
  bind('$Root').toConstructor(Root)
  bind('$param1').toInstance('the first injected parameter')
  bind('$param2').toInstance('the second injected parameter')
  bind('$param3').toInstance('the third injected parameter')
  bind('$param4').toInstance('the fourth injected parameter')
  bind('$param5').toInstance('the fifth injected parameter')
  bind('$param6').toInstance('the sixth injected parameter')
  bind('$param7').toInstance('the seventh injected parameter')
  bind('$param8').toInstance('the eighth injected parameter')
  bind('$param9').toInstance('the ninth injected parameter')

  const error = yield t.throws(bind.get('$Root'), Error)

  t.is(error.message, "Pluto cannot inject constructor functions with 8 or more arguments at this time (it's a long story).  Please use a non-constructor factory function instead or consider injecting fewer dependencies.")
})

test('bind.get(name) rejects if the specified name is not mapped', function* (t) {
  const bind = pluto()
  const error = yield t.throws(bind.get('totally bogus key'), Error)

  t.is(error.message, "nothing is mapped for name 'totally bogus key'")
})

test('Module.getAll([names]) accepts an array of names and returns a matching array of instances', function* (t) {
  const bind = pluto()
  bind('a').toInstance('A')
  bind('b').toInstance('B')

  const actual = yield bind.getAll(['a', 'b'])
  t.deepEqual(actual, ['A', 'B'])
})

test('Module.getAll([names]) throws if a name is unmapped', function* (t) {
  const bind = pluto()
  bind('a').toInstance('A')

  const error = yield t.throws(bind.getAll(['a', 'totally bogus key']), Error)

  t.is(error.message, "nothing is mapped for name 'totally bogus key'")
})

test.skip('Module.eageryLoadAll executes all factory and constructor functions', function* (t) {
  let constructorCalled = false
  let factoryCalled = false

  const bind = pluto()
  bind('Constructor').toConstructor(function FakeConstructor() {
    constructorCalled = true
  })
  bind('factory').toFactory(function fakeFactory() {
    factoryCalled = true
  })

  bind.eagerlyLoadAll()

  t.truthy(constructorCalled, 'constructor is called')
  t.truthy(factoryCalled, 'factory function is called')
})
