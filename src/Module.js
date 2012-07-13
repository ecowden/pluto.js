define([
    "underscore"
], function (_) {
    var createInstanceResolver = function (instance) {
        return function () {
            return instance;
        };
    };

    var getParamNames = function (func) {
        var funStr = func.toString();
        return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
    };

    function createParameters(module, paramNames) {
        var params = [];
        _.each(paramNames, function (paramName) {
            var param = module.get(paramName);
            params.push(param);
        });
        return params;
    }

    var createFactoryResolver = function (module, factory) {

        return function () {
            var paramNames = getParamNames(factory);
            if (!paramNames || paramNames.length === 0) {
                return factory();
            }

            var params = createParameters(module, paramNames);
            return factory.apply(factory, params);
        };
    };

    var maxConstructorParameters = 8;
    var createConstructorResolver = function (module, Constructor) {
        return function () {
            /*
             * It turns out that dynamically invoking constructor functions is a bit tricky.  I have decided to
             * manually invoke them for now until I can do further research and choose the best alternative.
             * For now, constructor injection will be limited to eight parameters.  --EJC
             */
            var paramNames = getParamNames(Constructor);
            if (!paramNames || paramNames.length === 0) {
                return new Constructor();
            }

            var paramCount = paramNames.length;
            var params = createParameters(module, paramNames);
            if (paramCount === 1) {
                return new Constructor(params[0]);
            }

            if (paramCount === 2) {
                return new Constructor(params[0], params[1]);
            }

            if (paramCount === 3) {
                return new Constructor(params[0], params[1], params[2]);
            }

            if (paramCount === 4) {
                return new Constructor(params[0], params[1], params[2], params[3]);
            }

            if (paramCount === 5) {
                return new Constructor(params[0], params[1], params[2], params[3], params[4]);
            }

            if (paramCount === 6) {
                return new Constructor(params[0], params[1], params[2], params[3], params[4], params[5]);
            }

            if (paramCount === 7) {
                return new Constructor(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
            }

            if (paramCount === 8) {
                return new Constructor(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7]);
            }

            var msg = "Pluto cannot inject constructor functions with " + maxConstructorParameters + " or more parameters " +
                "at this time (it's a long story).  Please use a non-constructor factory funtion instead or consider injecting fewer dependencies.";
            throw msg;
        };
    };


    var Module = function () {
        this.namesToResolvers = {};
    };


    Module.create = function (callback) {
        var module = new Module();

        callback(function (name) {
            function validateBinding(target) {
                if (_.has(module.namesToResolvers, name)) {
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
                    module.namesToResolvers[name] = createInstanceResolver(instance);
                },
                toFactory: function (factory) {
                    validateBinding(factory);
                    validateTargetIsAFunction(factory);
                    module.namesToResolvers[name] = createFactoryResolver(module, factory);
                },
                toConstructor: function (constructor) {
                    validateBinding(constructor);
                    validateTargetIsAFunction(constructor);
                    module.namesToResolvers[name] = createConstructorResolver(module, constructor);
                }
            };
        });

        return module;
    };

    Module.prototype.get = function (name) {
        var resolver = this.namesToResolvers[name];
        if (!resolver) {
            throw "nothing is mapped for name '" + name + "'";
        }
        return resolver();
    };

    return Module;
});