define([
    "underscore",
    "Module"
], function (_, Module) {
    describe("Module", function () {
        var Injected = function () {

        };

        describe("Module.create( ... )", function () {
            it("calls the first parameter callback with a 'bind' parameter", function () {
                var actualBind;

                Module.create(function (bind) {
                    actualBind = bind;
                });

                expect(actualBind).toBeDefined();
            });

            describe("bind(name) ...", function () {
                describe(".toInstance(instance)", function () {
                    it("throws if instance parameter is null", function () {
                        expect(function () {
                            Module.create(function (bind) {
                                bind("$injected").toInstance(null);
                            });
                        }).toThrow();
                    });

                    it("throws if instance parameter is undefined", function () {
                        expect(function () {
                            Module.create(function (bind) {
                                bind("$injected").toInstance(undefined);
                            });
                        }).toThrow();
                    });

                    it("throws if a mapping with the given name already exists", function () {
                        expect(function () {
                            Module.create(function (bind) {
                                bind("$injected").toInstance({});
                                bind("$injected").toInstance({});
                            });
                        }).toThrow();
                    });


                    it("module.get(name) returns the instance", function () {
                        var expected = {};
                        var module = Module.create(function (bind) {
                            bind("$injected").toInstance(expected);
                        });

                        var actual = module.get("$injected");
                        expect(actual).toBe(expected);
                    });
                });
                // --- / bind(...).toInstance(...) ---

                describe(".toFactory(factory)", function () {
                    it("throws if factory parameter is null", function () {
                        expect(function () {
                            Module.create(function (bind) {
                                bind("$injected").toFactory(null);
                            });
                        }).toThrow();
                    });

                    it("throws if factory parameter is undefined", function () {
                        expect(function () {
                            Module.create(function (bind) {
                                bind("$injected").toFactory(undefined);
                            });
                        }).toThrow();
                    });

                    it("throws if a mapping with the given name already exists", function () {
                        var factory = function () {
                        };

                        expect(function () {
                            Module.create(function (bind) {
                                bind("$injected").toFactory(factory);
                                bind("$injected").toFactory(factory);
                            });
                        }).toThrow();
                    });

                    it("throws if the factory is not a function", function () {
                        expect(function () {
                            Module.create(function (bind) {
                                bind("$injected").toFactory({});
                            });
                        }).toThrow();
                    });

                    it("when the factory has no parameters, module.get(name) returns the result of the factory's invocation", function () {
                        var expected = {};
                        var factory = function () {
                            return expected;
                        };

                        var module = Module.create(function (bind) {
                            bind("$injected").toFactory(factory);
                        });

                        var actual = module.get("$injected");
                        expect(actual).toBe(expected);
                    });

                    it("module.get(name) injects the factory function's parameters, then returns the result from the factory's invocation", function () {
                        var expectedParam = {};
                        var factory = function ($param) {
                            return {
                                param: $param
                            };
                        };

                        var module = Module.create(function (bind) {
                            bind("$root").toFactory(factory);
                            bind("$param").toInstance(expectedParam);
                        });

                        var actual = module.get("$root");
                        expect(actual.param).toBe(expectedParam);
                    });
                }); // --- / bind(...).toFactory(...) ---

                describe(".toFactory(factory)", function () {
                    it("throws if constructor parameter is null", function () {
                        expect(function () {
                            Module.create(function (bind) {
                                bind("$injected").toConstructor(null);
                            });
                        }).toThrow();
                    });

                    it("throws if factory parameter is undefined", function () {
                        expect(function () {
                            Module.create(function (bind) {
                                bind("$injected").toConstructor(undefined);
                            });
                        }).toThrow();
                    });
//
                    it("throws if a mapping with the given name already exists", function () {
                        var Constructor = function () {
                        };

                        expect(function () {
                            Module.create(function (bind) {
                                bind("$injected").toConstructor(Constructor);
                                bind("$injected").toConstructor(Constructor);
                            });
                        }).toThrow();
                    });

                    it("throws if the constructor is not a function", function () {
                        expect(function () {
                            Module.create(function (bind) {
                                bind("$injected").toConstructor({});
                            });
                        }).toThrow();
                    });

                    it("when the constructor has no parameters, module.get(name) returns the result of new Constructor()", function () {
                        var Constructor = function () {
                        };

                        var module = Module.create(function (bind) {
                            bind("$injected").toConstructor(Constructor);
                        });

                        var actual = module.get("$injected");

                        expect(actual).toBeDefined();
                        expect(actual instanceof Constructor).toBeTruthy();
                    });

                    it("when the constructor has one parameter, module.get(name) returns the result of new Constructor() with the parameter injected", function () {
                        var param = "-- the injected parameter --";
                        var Root = function ($param) {
                            this.param = $param;
                        };

                        var module = Module.create(function (bind) {
                            bind("$Root").toConstructor(Root);
                            bind("$param").toInstance(param);
                        });

                        var actual = module.get("$Root");

                        expect(actual).toBeDefined();
                        expect(actual instanceof Root).toBeTruthy();
                        expect(actual.param).toBe(param);
                    });

                }); // --- / bind(...).toConstructor(...) ---
            });
        });

        describe("get(...)", function () {
            it("throws if the specified name is not mapped", function () {
                var instance = Module.create(function (bind) {
                });
                expect(function () {
                    instance.get("totally bogus key");
                }).toThrow();
            });
        });

    });
});