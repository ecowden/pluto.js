const _ = require('underscore')
const co = require('co')
const MAX_CONSTRUCTOR_ARGUMENTS = 8

function isPromise(obj) {
  // TODO this feels quick and dirty. Is there a better way?
  return obj.then && typeof obj.then === 'function'
}

function pluto() {
  const namesToResolvers = {}

  function createInstanceResolver(instance) {
    if (isPromise(instance)) {
      return instance
    } else {
      return function () {
        return Promise.resolve(instance)
      }
    }
  }

  function getArgumentNames(func) {
    const funStr = func.toString()
    return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g)
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
      /*
       * It turns out that dynamically invoking constructor functions is a bit tricky.  I have decided to
       * manually invoke them for now until I can do further research and choose the best alternative.
       * For now, constructor injection will be limited to eight arguments.
       */
      const argumentNames = getArgumentNames(Constructor)
      if (!argumentNames || argumentNames.length === 0) {
        return new Constructor()
      }

      const argumentCount = argumentNames.length
      const args = yield getAll(argumentNames)
      if (argumentCount === 1) {
        return new Constructor(args[0])
      }

      if (argumentCount === 2) {
        return new Constructor(args[0], args[1])
      }

      if (argumentCount === 3) {
        return new Constructor(args[0], args[1], args[2])
      }

      if (argumentCount === 4) {
        return new Constructor(args[0], args[1], args[2], args[3])
      }

      if (argumentCount === 5) {
        return new Constructor(args[0], args[1], args[2], args[3], args[4])
      }

      if (argumentCount === 6) {
        return new Constructor(args[0], args[1], args[2], args[3], args[4], args[5])
      }

      if (argumentCount === 7) {
        return new Constructor(args[0], args[1], args[2], args[3], args[4], args[5], args[6])
      }

      if (argumentCount === 8) {
        return new Constructor(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7])
      }

      const msg = 'Pluto cannot inject constructor functions with ' + MAX_CONSTRUCTOR_ARGUMENTS + ' or more arguments ' +
        "at this time (it's a long story).  Please use a non-constructor factory function instead or consider injecting fewer dependencies."
      throw Error(msg)
    })
  }

  const get = _.memoize((name) => {
    return new Promise((resolve, reject) => {
      const resolver = namesToResolvers[name]
      if (!resolver) {
        reject(new Error("nothing is mapped for name '" + name + "'"))
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
    _.keys(namesToResolvers).forEach(function (name) {
      get(name)
    })
  }

  function bind(name) {
    function validateBinding(target) {
      if (_.has(namesToResolvers, name)) {
        throw Error('module already contains a mapping with the name \'' + name + '\'')
      }
      if (_.isUndefined(target)) {
        throw Error('cannot bind \'' + name + '\' because the specified target is undefined.')
      }
      if (_.isNull(target)) {
        throw Error('cannot bind \'' + name + '\' because the specified target is null.')
      }
    }

    function validateTargetIsAFunction(factory) {
      if (!_.isFunction(factory)) {
        throw Error('cannot bind \'' + name + '\' because the specified target is not a function.')
      }
    }

    return {
      toInstance: function (instance) {
        validateBinding(instance)
        namesToResolvers[name] = createInstanceResolver(instance)
      },
      toFactory: function (factory) {
        validateBinding(factory)
        validateTargetIsAFunction(factory)
        namesToResolvers[name] = createFactoryResolver(factory)
      },
      toConstructor: function (constructor) {
        validateBinding(constructor)
        validateTargetIsAFunction(constructor)
        namesToResolvers[name] = createConstructorResolver(constructor)
      }
    }
  }

  bind.get = get
  bind.getAll = getAll
  bind.eagerlyLoadAll = eagerlyLoadAll

  return bind
}

exports = module.exports = pluto
