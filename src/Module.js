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

    var createFactoryResolver = function (module, factory) {
        return function () {
            var paramNames = getParamNames(factory);
            if (!paramNames || paramNames.length === 0) {
                return factory();
            }

            var params = [];
            _.each(paramNames, function (paramName) {
                var param = module.get(paramName);
                params.push(param);
            });
            var result = factory.apply(factory, params);
            return result;
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
                    module.namesToResolvers[name] = createFactoryResolver(module, constructor);
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