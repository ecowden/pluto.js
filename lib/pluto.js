'use strict'

const co = require('co')
const memoize = require('lodash.memoize')

function isPromise(obj) {
  return obj && obj.then && typeof obj.then === 'function'
}

function pluto() {
  const namesToResolvers = new Map()

  function createInstanceResolver(instance) {
    return function () {
      return Promise.resolve(instance)
    }
  }

  function getArgumentNames(func) {
    const funStr = func.toString()
    const argumentNames = funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g)

    // the above can return `null` when there are no argumentNames
    return argumentNames || []
  }

  function createFactoryResolver(factory) {
    return co.wrap(function* () {
      if (isPromise(factory)) {
        factory = yield factory
      }

      const argumentNames = getArgumentNames(factory)
      const args = yield getAll(argumentNames)
      return factory.apply(factory, args)
    })
  }

  function createConstructorResolver(Constructor) {
    return co.wrap(function* () {
      if (isPromise(Constructor)) {
        Constructor = yield Constructor
      }
      const argumentNames = getArgumentNames(Constructor)
      const args = yield getAll(argumentNames)

      // For future reference,
      //   this can be done with the spread operator in Node versions >= v5. e.g.,
      //
      //   return new Constructor(...args)
      //
      // For now, this workaround is a good middle ground.

      // eslint-disable-next-line
      return new(Constructor.bind.apply(Constructor, [null].concat(args)))
    })
  }

  const get = memoize((name) => {
    return new Promise((resolve, reject) => {
      const resolver = namesToResolvers.get(name)
      if (!resolver) {
        reject(new Error(`nothing is mapped for name '${name}'`))
      }
      resolve(resolver())
    })
  })

  function getAll(names) {
    const promises = names.map(function (name) {
      return get(name)
    })
    return Promise.all(promises)
  }

  function bootstrap() {
    const result = new Map()
    const promises = []
    for (let name of namesToResolvers.keys()) {
      promises.push(get(name).then((value) => {
        result.set(name, value)
      }))
    }
    return Promise.all(promises).then(() => {
      return result
    })
  }

  function bind(name) {
    function validateBinding(target) {
      if (namesToResolvers.has(name)) {
        throw Error(`module already contains a mapping with the name '${name}'`)
      }
      if (typeof target === 'undefined') {
        throw Error(`cannot bind '${name}' because the specified target is undefined.`)
      }
      if (target === null) {
        throw Error(`cannot bind '${name}' because the specified target is null.`)
      }
    }

    function validateTargetIsAFunctionOrPromise(factory) {
      if (typeof factory !== 'function' && !isPromise(factory)) {
        throw Error(`cannot bind '${name}' because the specified target is not a function or Promise.`)
      }
    }

    return {
      toInstance: function (instance) {
        validateBinding(instance)
        namesToResolvers.set(name, createInstanceResolver(instance))
      },
      toFactory: function (factory) {
        validateBinding(factory)
        validateTargetIsAFunctionOrPromise(factory)
        namesToResolvers.set(name, createFactoryResolver(factory))
      },
      toConstructor: function (constructor) {
        validateBinding(constructor)
        validateTargetIsAFunctionOrPromise(constructor)
        namesToResolvers.set(name, createConstructorResolver(constructor))
      }
    }
  }

  bind.get = get
  bind.getAll = getAll
  bind.bootstrap = bootstrap

  return bind
}

exports = module.exports = pluto
