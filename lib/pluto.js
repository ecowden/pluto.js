'use strict'

const co = require('co')
const memoize = require('lodash.memoize')

const MAX_CONSTRUCTOR_ARGUMENTS = 8

function isPromise(obj) {
  return obj && obj.then && typeof obj.then === 'function'
}

function pluto() {
  const namesToResolvers = new Map()

  function createInstanceResolver(instance) {
    return function () {
      if (isPromise(instance)) {
        return instance
      } else {
        return Promise.resolve(instance)
      }
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
      const argumentNames = getArgumentNames(factory)
      if (!argumentNames || argumentNames.length === 0) {
        return factory()
      }

      const args = yield getAll(argumentNames)
      return factory.apply(factory, args)
    })
  }

  function createConstructorResolver(Constructor) {
    return co.wrap(function* () {
      const argumentNames = getArgumentNames(Constructor)
      const args = yield getAll(argumentNames)

      // For future reference,
      //   this can be done with the spread operator in Node versions >= v5. e.g.,
      //
      //   return new Constructor(...args)
      //
      // For now, this workaround is a good middle ground.

      return new (Constructor.bind.apply(Constructor, [null].concat(args)))
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

  function eagerlyLoadAll() {
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

    function validateTargetIsAFunction(factory) {
      if (typeof factory !== 'function') {
        throw Error(`cannot bind '${name}' because the specified target is not a function.`)
      }
    }

    return {
      toInstance: function (instance) {
        validateBinding(instance)
        namesToResolvers.set(name, createInstanceResolver(instance))
      },
      toFactory: function (factory) {
        validateBinding(factory)
        validateTargetIsAFunction(factory)
        namesToResolvers.set(name, createFactoryResolver(factory))
      },
      toConstructor: function (constructor) {
        validateBinding(constructor)
        validateTargetIsAFunction(constructor)
        namesToResolvers.set(name, createConstructorResolver(constructor))
      }
    }
  }

  bind.get = get
  bind.getAll = getAll
  bind.eagerlyLoadAll = eagerlyLoadAll

  return bind
}

exports = module.exports = pluto
