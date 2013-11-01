var _ = require('underscore'),
    MAX_CONSTRUCTOR_ARGUMENTS = 8;

var createModule = function (createModuleCallback) {
    function createInstanceResolver(instance) {
        return function () {
            return instance;
        };
    };

    function getArgumentNames(func) {
        var funStr = func.toString();
        return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
    };

    function createFactoryResolver(factory) {
        return function () {
            var argumentNames = getArgumentNames(factory);
            if (!argumentNames || argumentNames.length === 0) {
                return factory();
            }

            var args = getAll(argumentNames);
            return factory.apply(factory, args);
        };
    };


    var createConstructorResolver = function (Constructor) {
        return function () {
            /*
             * It turns out that dynamically invoking constructor functions is a bit tricky.  I have decided to
             * manually invoke them for now until I can do further research and choose the best alternative.
             * For now, constructor injection will be limited to eight arguments.
             */
            var argumentNames = getArgumentNames(Constructor);
            if (!argumentNames || argumentNames.length === 0) {
                return new Constructor();
            }

            var argumentCount = argumentNames.length;
            var args = getAll(argumentNames);
            if (argumentCount === 1) {
                return new Constructor(args[0]);
            }

            if (argumentCount === 2) {
                return new Constructor(args[0], args[1]);
            }

            if (argumentCount === 3) {
                return new Constructor(args[0], args[1], args[2]);
            }

            if (argumentCount === 4) {
                return new Constructor(args[0], args[1], args[2], args[3]);
            }

            if (argumentCount === 5) {
                return new Constructor(args[0], args[1], args[2], args[3], args[4]);
            }

            if (argumentCount === 6) {
                return new Constructor(args[0], args[1], args[2], args[3], args[4], args[5]);
            }

            if (argumentCount === 7) {
                return new Constructor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
            }

            if (argumentCount === 8) {
                return new Constructor(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
            }

            var msg = "Pluto cannot inject constructor functions with " + MAX_CONSTRUCTOR_ARGUMENTS + " or more arguments " +
                "at this time (it's a long story).  Please use a non-constructor factory function instead or consider injecting fewer dependencies.";
            throw msg;
        };
    };


    var namesToResolvers = {};

    var get = _.memoize(function (name) {

        var resolver = namesToResolvers[name];
        if (!resolver) {
            throw "nothing is mapped for name '" + name + "'";
        }
        return resolver();
    });

    function getAll(names) {
        var instances = [];
        names.forEach(function (name) {
            var instance = get(name);
            instances.push(instance);
        });
        return instances;
    }

    createModuleCallback(function (name) {
        function validateBinding(target) {
            if (_.has(namesToResolvers, name)) {
                throw "module already contains a mapping with the name '" + name + "'";
            }
            if (_.isUndefined(target)) {
                throw "cannot bind '" + name + "' because the specified target is undefined.";
            }
            if (_.isNull(target)) {
                throw "cannot bind '" + name + "' because the specified target is null.";
            }
        }

        function validateTargetIsAFunction(factory) {
            if (!_.isFunction(factory)) {
                throw "cannot bind '" + name + "' because the specified target is not a function.";
            }
        }

        return {
            toInstance: function (instance) {
                validateBinding(instance);
                namesToResolvers[name] = createInstanceResolver(instance);
            },
            toFactory: function (factory) {
                validateBinding(factory);
                validateTargetIsAFunction(factory);
                namesToResolvers[name] = createFactoryResolver(factory);
            },
            toConstructor: function (constructor) {
                validateBinding(constructor);
                validateTargetIsAFunction(constructor);
                namesToResolvers[name] = createConstructorResolver(constructor);
            }
        };
    });

    return {
        get: get,
        getAll: getAll
    };
};

exports = module.exports = {
    createModule: createModule
};
