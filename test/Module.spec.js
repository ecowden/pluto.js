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

                    it("module.get(name) returns the result from the factory's invocation when the factory has no parameters", function () {
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
                        var factory = function () {
                        };

                        expect(function () {
                            Module.create(function (bind) {
                                bind("$injected").toConstructor(factory);
                                bind("$injected").toConstructor(factory);
                            });
                        }).toThrow();
                    });

                    it("throws if the factory is not a function", function () {
                        expect(function () {
                            Module.create(function (bind) {
                                bind("$injected").toConstructor({});
                            });
                        }).toThrow();
                    });
//
//                    it("module.get(name) returns the result from the factory's invocation when the factory has no parameters", function () {
//                        var expected = {};
//                        var factory = function () {
//                            return expected;
//                        };
//
//                        var module = Module.create(function (bind) {
//                            bind("$injected").toFactory(factory);
//                        });
//
//                        var actual = module.get("$injected");
//                        expect(actual).toBe(expected);
//                    });
//
//                    it("module.get(name) injects the factory function's parameters, then returns the result from the factory's invocation", function () {
//                        var expectedParam = {};
//                        var factory = function ($param) {
//                            return {
//                                param: $param
//                            };
//                        };
//
//                        var module = Module.create(function (bind) {
//                            bind("$root").toFactory(factory);
//                            bind("$param").toInstance(expectedParam);
//                        });
//
//                        var actual = module.get("$root");
//                        expect(actual.param).toBe(expectedParam);
//                    });
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