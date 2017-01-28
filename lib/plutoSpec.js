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

test('bind(name).toFactory(factory) throws if factory is null', function* (t) {
  const error = t.throws(() => {
    pluto.createModule(function (bind) {
      bind('$injected').toFactory(null)
    }, Error)
  })
  t.is(error.message, "cannot bind '$injected' because the specified target is null.")
})

test('bind(name).toFactory(factory) throws if factory parameter is undefined', function* (t) {
  const error = t.throws(() => {
    pluto.createModule(function (bind) {
      bind('$injected').toFactory(undefined)
    }, Error)
  })
  t.is(error.message, "cannot bind '$injected' because the specified target is undefined.")
})

test('bind(name).toFactory(instance) throws if the name is a duplicate', function* (t) {
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

test('bind(name).toConstructor(constructor) throws if constructor is null', function* (t) {
  const error = t.throws(() => {
    pluto.createModule(function (bind) {
      bind('$injected').toConstructor(null)
    }, Error)
  })
  t.is(error.message, "cannot bind '$injected' because the specified target is null.")
})

test('bind(name).toConstructor(constructor) throws if constructor is undefined', function* (t) {
  const error = t.throws(() => {
    pluto.createModule(function (bind) {
      bind('$injected').toConstructor(undefined)
    }, Error)
  })
  t.is(error.message, "cannot bind '$injected' because the specified target is undefined.")
})

test('bind(name).toConstructor(constructor) throws if the name is a duplicate', function* (t) {
  function Constructor() {}

  const error = t.throws(() => {
    pluto.createModule(function (bind) {
      bind('$injected').toConstructor(Constructor)
      bind('$injected').toConstructor(Constructor)
    }, Error)
  })
  t.is(error.message, "module already contains a mapping with the name '$injected'")
})

test('bind(name).toConstructor(instance) throws if the constructor is not a function', function* (t) {
  const notAFunction = {}

  const error = t.throws(() => {
    pluto.createModule(function (bind) {
      bind('$injected').toConstructor(notAFunction)
    }, Error)
  })
  t.is(error.message, "cannot bind '$injected' because the specified target is not a function.")
})

test('when the constructor has zero parameters, module.get(name) returns the result of new Constructor()', function* (t) {
  const Constructor = function () {}

  const module = pluto.createModule(function (bind) {
    bind('$injected').toConstructor(Constructor)
  })

  const actual = module.get('$injected')

  t.truthy(actual instanceof Constructor)
})

test('when the constructor has one parameter, module.get(name) returns the result of new Constructor() with the parameter injected', function* (t) {
  const Root = function ($param1) {
    this.param1 = $param1
  }

  const module = pluto.createModule(function (bind) {
    bind('$Root').toConstructor(Root)
    bind('$param1').toInstance('the first injected parameter')
  })

  const actual = module.get('$Root')

  t.truthy(actual instanceof Root)
  t.is(actual.param1, 'the first injected parameter')
})

test('when the constructor has two parameters, module.get(name) returns the result of new Constructor() with the parameters injected', function* (t) {
  const Root = function ($param1, $param2) {
    this.param1 = $param1
    this.param2 = $param2
  }

  const module = pluto.createModule(function (bind) {
    bind('$Root').toConstructor(Root)
    bind('$param1').toInstance('the first injected parameter')
    bind('$param2').toInstance('the second injected parameter')
  })

  const actual = module.get('$Root')

  t.truthy(actual instanceof Root)
  t.is(actual.param1, 'the first injected parameter')
  t.is(actual.param2, 'the second injected parameter')
})

test('when the constructor has three parameters, module.get(name) returns the result of new Constructor() with the parameters injected', function* (t) {
  const Root = function ($param1, $param2, $param3) {
    this.param1 = $param1
    this.param2 = $param2
    this.param3 = $param3
  }

  const module = pluto.createModule(function (bind) {
    bind('$Root').toConstructor(Root)
    bind('$param1').toInstance('the first injected parameter')
    bind('$param2').toInstance('the second injected parameter')
    bind('$param3').toInstance('the third injected parameter')
  })

  const actual = module.get('$Root')

  t.truthy(actual instanceof Root)
  t.is(actual.param1, 'the first injected parameter')
  t.is(actual.param2, 'the second injected parameter')
  t.is(actual.param3, 'the third injected parameter')
})

test('when the constructor has four parameters, module.get(name) returns the result of new Constructor() with the parameters injected', function* (t) {
  const Root = function ($param1, $param2, $param3, $param4) {
    this.param1 = $param1
    this.param2 = $param2
    this.param3 = $param3
    this.param4 = $param4
  }

  const module = pluto.createModule(function (bind) {
    bind('$Root').toConstructor(Root)
    bind('$param1').toInstance('the first injected parameter')
    bind('$param2').toInstance('the second injected parameter')
    bind('$param3').toInstance('the third injected parameter')
    bind('$param4').toInstance('the fourth injected parameter')
  })

  const actual = module.get('$Root')


  t.truthy(actual instanceof Root)
  t.is(actual.param1, 'the first injected parameter')
  t.is(actual.param2, 'the second injected parameter')
  t.is(actual.param3, 'the third injected parameter')
  t.is(actual.param4, 'the fourth injected parameter')
})

test('when the constructor has five parameters, module.get(name) returns the result of new Constructor() with the parameters injected', function* (t) {
  const Root = function ($param1, $param2, $param3, $param4, $param5) {
    this.param1 = $param1
    this.param2 = $param2
    this.param3 = $param3
    this.param4 = $param4
    this.param5 = $param5
  }

  const module = pluto.createModule(function (bind) {
    bind('$Root').toConstructor(Root)
    bind('$param1').toInstance('the first injected parameter')
    bind('$param2').toInstance('the second injected parameter')
    bind('$param3').toInstance('the third injected parameter')
    bind('$param4').toInstance('the fourth injected parameter')
    bind('$param5').toInstance('the fifth injected parameter')
  })

  const actual = module.get('$Root')


  t.truthy(actual instanceof Root)
  t.is(actual.param1, 'the first injected parameter')
  t.is(actual.param2, 'the second injected parameter')
  t.is(actual.param3, 'the third injected parameter')
  t.is(actual.param4, 'the fourth injected parameter')
  t.is(actual.param5, 'the fifth injected parameter')
})

test('when the constructor has six parameters, module.get(name) returns the result of new Constructor() with the parameters injected', function* (t) {
  const Root = function ($param1, $param2, $param3, $param4, $param5, $param6) {
    this.param1 = $param1
    this.param2 = $param2
    this.param3 = $param3
    this.param4 = $param4
    this.param5 = $param5
    this.param6 = $param6
  }

  const module = pluto.createModule(function (bind) {
    bind('$Root').toConstructor(Root)
    bind('$param1').toInstance('the first injected parameter')
    bind('$param2').toInstance('the second injected parameter')
    bind('$param3').toInstance('the third injected parameter')
    bind('$param4').toInstance('the fourth injected parameter')
    bind('$param5').toInstance('the fifth injected parameter')
    bind('$param6').toInstance('the sixth injected parameter')
  })

  const actual = module.get('$Root')


  t.truthy(actual instanceof Root)
  t.is(actual.param1, 'the first injected parameter')
  t.is(actual.param2, 'the second injected parameter')
  t.is(actual.param3, 'the third injected parameter')
  t.is(actual.param4, 'the fourth injected parameter')
  t.is(actual.param5, 'the fifth injected parameter')
  t.is(actual.param6, 'the sixth injected parameter')
})

test('when the constructor has seven parameters, module.get(name) returns the result of new Constructor() with the parameters injected', function* (t) {
  const Root = function ($param1, $param2, $param3, $param4, $param5, $param6, $param7) {
    this.param1 = $param1
    this.param2 = $param2
    this.param3 = $param3
    this.param4 = $param4
    this.param5 = $param5
    this.param6 = $param6
    this.param7 = $param7
  }

  const module = pluto.createModule(function (bind) {
    bind('$Root').toConstructor(Root)
    bind('$param1').toInstance('the first injected parameter')
    bind('$param2').toInstance('the second injected parameter')
    bind('$param3').toInstance('the third injected parameter')
    bind('$param4').toInstance('the fourth injected parameter')
    bind('$param5').toInstance('the fifth injected parameter')
    bind('$param6').toInstance('the sixth injected parameter')
    bind('$param7').toInstance('the seventh injected parameter')
  })

  const actual = module.get('$Root')


  t.truthy(actual instanceof Root)
  t.is(actual.param1, 'the first injected parameter')
  t.is(actual.param2, 'the second injected parameter')
  t.is(actual.param3, 'the third injected parameter')
  t.is(actual.param4, 'the fourth injected parameter')
  t.is(actual.param5, 'the fifth injected parameter')
  t.is(actual.param6, 'the sixth injected parameter')
  t.is(actual.param7, 'the seventh injected parameter')
})

test('when the constructor has eight parameters, module.get(name) returns the result of new Constructor() with the parameters injected', function* (t) {
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

  const module = pluto.createModule(function (bind) {
    bind('$Root').toConstructor(Root)
    bind('$param1').toInstance('the first injected parameter')
    bind('$param2').toInstance('the second injected parameter')
    bind('$param3').toInstance('the third injected parameter')
    bind('$param4').toInstance('the fourth injected parameter')
    bind('$param5').toInstance('the fifth injected parameter')
    bind('$param6').toInstance('the sixth injected parameter')
    bind('$param7').toInstance('the seventh injected parameter')
    bind('$param8').toInstance('the eighth injected parameter')
  })

  const actual = module.get('$Root')


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

test('when the constructor has nine parameters, module.get(name) throws an exception', function* (t) {
  // TODO: this is an issue that should be easy to work around nowadays
  const Root = function ($param1, $param2, $param3, $param4, $param5, $param6, $param7, $param8, $param9) {}

  const module = pluto.createModule(function (bind) {
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
  })

  const error = t.throws(function () {
    module.get('$Root')
  }, Error)
  t.is(error.message, "Pluto cannot inject constructor functions with 8 or more arguments at this time (it's a long story).  Please use a non-constructor factory function instead or consider injecting fewer dependencies.")
})
