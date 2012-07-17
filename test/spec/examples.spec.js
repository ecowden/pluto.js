(function () {
    /*
     * We want to support AMD, CommonJS and plain old script loading.  To to this, we define the bulk of the code in a
     * "factory," then wire it all up appropriately at the end of the script.
     */
    var factory = function (_, pluto) {
        describe("examples", function () {

            it("should fail (on purpose!)", function () {
                expect(1).toBe(2);
            });

            it("bind to instance", function () {
                var anInstance = {}; // can be any JavaScript object
                var module = pluto.createModule(function (bind) {
                    bind("myInstance").toInstance(anInstance);
                });

                var plutosInstance = module.get("myInstance"); // plutosInstance is anInstance
                expect(plutosInstance).toBe(anInstance);
            });

            it("bind to constructor", function () {
                var aGreeting = "Hello, world!";
                var Greeter = function (greeting) {
                    this.greeting = greeting;
                };

                Greeter.prototype.greet = function () {
                    return this.greeting;
                };

                var module = pluto.createModule(function (bind) {
                    bind("greeting").toInstance(aGreeting);
                    bind("greeter").toConstructor(Greeter);
                });

                var theGreeter = module.get("greeter");
                // console.log(theGreeter.greet()); //prints, "Hello, world!"

                expect(theGreeter.greet()).toBe("Hello, world!");
            });

            it("bind to factory function", function () {
                var aGreeting = "Hello, world!";
                var greeterFactory = function (greeting) {
                    // if this bit of code confuses you, Google, "JavaScript currying." ;-)
                    return function () {
                        return greeting;
                    };
                };

                var module = pluto.createModule(function (bind) {
                    bind("greeting").toInstance(aGreeting);
                    bind("greeter").toFactory(greeterFactory);
                });

                var theGreeter = module.get("greeter");
                // console.log(theGreeter()); //prints, "Hello, world!"

                expect(theGreeter()).toBe("Hello, world!");
            });

        });
    };

    /*
     * RequireJS module definition
     */
    if (typeof define === 'function' && define.amd) {
        define([
            "underscore",
            "pluto"
        ], function (_, pluto) {
            return factory(_, pluto);
        });
    } else if (typeof exports !== 'undefined') { // CommonJS module definition
        if (typeof module !== 'undefined' && module.exports) {
            var _ = require("underscore");
            var pluto = require("../../src/pluto");
            module.exports = exports = factory(_, pluto);
        }
    } else { // Plains ol' script-on-a-page (probably...)
        factory(window._, window.pluto);
    }
}());