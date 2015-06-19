var pluto = require('../lib/pluto');

describe("pluto", function() {

  describe("pluto.createModule( ... )", function() {
    it("invokes the callback passed as the first parameter with a 'bind' parameter", function() {
      var actualBind;

      pluto.createModule(function(bind) {
        actualBind = bind;
      });

      expect(actualBind).toBeDefined();
    });

    describe("bind(name) ...", function() {
      describe(".toInstance(instance)", function() {
        it("throws if instance parameter is null", function() {
          expect(function() {
            pluto.createModule(function(bind) {
              bind('$injected').toInstance(null);
            });
          }).toThrow();
        });

        it("throws if instance parameter is undefined", function() {
          expect(function() {
            pluto.createModule(function(bind) {
              bind('$injected').toInstance(undefined);
            });
          }).toThrow();
        });

        it("throws if a mapping with the given name already exists", function() {
          expect(function() {
            pluto.createModule(function(bind) {
              bind('$injected').toInstance({});
              bind('$injected').toInstance({});
            });
          }).toThrow();
        });


        it("module.get(name) returns the instance", function() {
          var expected = {};
          var module = pluto.createModule(function(bind) {
            bind('$injected').toInstance(expected);
          });

          var actual = module.get('$injected');
          expect(actual).toBe(expected);
        });
      });
      // --- / bind(...).toInstance(...) ---

      describe(".toFactory(factory)", function() {
        it("throws if factory parameter is null", function() {
          expect(function() {
            pluto.createModule(function(bind) {
              bind("$injected").toFactory(null);
            });
          }).toThrow();
        });

        it('throws if factory parameter is undefined', function() {
          expect(function() {
            pluto.createModule(function(bind) {
              bind('$injected').toFactory(undefined);
            });
          }).toThrow();
        });

        it("throws if a mapping with the given name already exists", function() {
          var factory = function() {};

          expect(function() {
            pluto.createModule(function(bind) {
              bind('$injected').toFactory(factory);
              bind('$injected').toFactory(factory);
            });
          }).toThrow();
        });

        it("throws if the factory is not a function", function() {
          expect(function() {
            pluto.createModule(function(bind) {
              bind('$injected').toFactory({});
            });
          }).toThrow();
        });

        it("when the factory has zero parameters, module.get(name) returns the result of the factory's invocation", function() {
          var expected = {};
          var factory = function() {
            return expected;
          };

          var module = pluto.createModule(function(bind) {
            bind('$injected').toFactory(factory);
          });

          var actual = module.get('$injected');
          expect(actual).toBe(expected);
        });

        it("module.get(name) injects the factory function's parameters, then returns the result from the factory's invocation", function() {
          var expectedParam = {};
          var factory = function($param) {
            return {
              param: $param
            };
          };

          var module = pluto.createModule(function(bind) {
            bind('$root').toFactory(factory);
            bind('$param').toInstance(expectedParam);
          });

          var actual = module.get('$root');
          expect(actual.param).toBe(expectedParam);
        });

        it("memoizes invocation so that the factory function is only invoked once", function() {
          var invocationCount = 0,
            factory = function() {
              invocationCount++;
              return 'dummy';
            };

          var module = pluto.createModule(function(bind) {
            bind('$factory').toFactory(factory);
          });

          module.get('$factory');
          module.get('$factory');

          expect(invocationCount).toBe(1);
        });
      }); // --- / bind(...).toFactory(...) ---

      describe(".toConstructor(Constructor)", function() {
        it("throws if constructor parameter is null", function() {
          expect(function() {
            pluto.createModule(function(bind) {
              bind('$injected').toConstructor(null);
            });
          }).toThrow();
        });

        it("throws if factory parameter is undefined", function() {
          expect(function() {
            pluto.createModule(function(bind) {
              bind('$injected').toConstructor(undefined);
            });
          }).toThrow();
        });

        it("throws if a mapping with the given name already exists", function() {
          var Constructor = function() {};

          expect(function() {
            pluto.createModule(function(bind) {
              bind('$injected').toConstructor(Constructor);
              bind('$injected').toConstructor(Constructor);
            });
          }).toThrow();
        });

        it("throws if the constructor is not a function", function() {
          expect(function() {
            pluto.createModule(function(bind) {
              bind('$injected').toConstructor({});
            });
          }).toThrow();
        });

        it("when the constructor has zero parameters, module.get(name) returns the result of new Constructor()", function() {
          var Constructor = function() {};

          var module = pluto.createModule(function(bind) {
            bind('$injected').toConstructor(Constructor);
          });

          var actual = module.get('$injected');

          expect(actual).toBeDefined();
          expect(actual instanceof Constructor).toBeTruthy();
        });

        it("when the constructor has one parameter, module.get(name) returns the result of new Constructor() with the parameter injected", function() {
          var Root = function($param1) {
            this.param1 = $param1;
          };

          var module = pluto.createModule(function(bind) {
            bind('$Root').toConstructor(Root);
            bind('$param1').toInstance('the first injected parameter');
          });

          var actual = module.get('$Root');

          expect(actual).toBeDefined();
          expect(actual instanceof Root).toBeTruthy();
          expect(actual.param1).toBe('the first injected parameter');
        });

        it("when the constructor has two parameters, module.get(name) returns the result of new Constructor() with the parameters injected", function() {
          var Root = function($param1, $param2) {
            this.param1 = $param1;
            this.param2 = $param2;
          };

          var module = pluto.createModule(function(bind) {
            bind('$Root').toConstructor(Root);
            bind('$param1').toInstance('the first injected parameter');
            bind('$param2').toInstance('the second injected parameter');
          });

          var actual = module.get('$Root');

          expect(actual).toBeDefined();
          expect(actual instanceof Root).toBeTruthy();
          expect(actual.param1).toBe('the first injected parameter');
          expect(actual.param2).toBe('the second injected parameter');
        });

        it("when the constructor has three parameters, module.get(name) returns the result of new Constructor() with the parameters injected", function() {
          var Root = function($param1, $param2, $param3) {
            this.param1 = $param1;
            this.param2 = $param2;
            this.param3 = $param3;
          };

          var module = pluto.createModule(function(bind) {
            bind('$Root').toConstructor(Root);
            bind('$param1').toInstance('the first injected parameter');
            bind('$param2').toInstance('the second injected parameter');
            bind('$param3').toInstance('the third injected parameter');
          });

          var actual = module.get('$Root');

          expect(actual).toBeDefined();
          expect(actual instanceof Root).toBeTruthy();
          expect(actual.param1).toBe('the first injected parameter');
          expect(actual.param2).toBe('the second injected parameter');
          expect(actual.param3).toBe('the third injected parameter');
        });

        it("when the constructor has four parameters, module.get(name) returns the result of new Constructor() with the parameters injected", function() {
          var Root = function($param1, $param2, $param3, $param4) {
            this.param1 = $param1;
            this.param2 = $param2;
            this.param3 = $param3;
            this.param4 = $param4;
          };

          var module = pluto.createModule(function(bind) {
            bind('$Root').toConstructor(Root);
            bind('$param1').toInstance('the first injected parameter');
            bind('$param2').toInstance('the second injected parameter');
            bind('$param3').toInstance('the third injected parameter');
            bind('$param4').toInstance('the fourth injected parameter');
          });

          var actual = module.get('$Root');

          expect(actual).toBeDefined();
          expect(actual instanceof Root).toBeTruthy();
          expect(actual.param1).toBe('the first injected parameter');
          expect(actual.param2).toBe('the second injected parameter');
          expect(actual.param3).toBe('the third injected parameter');
          expect(actual.param4).toBe('the fourth injected parameter');
        });

        it("when the constructor has five parameters, module.get(name) returns the result of new Constructor() with the parameters injected", function() {
          var Root = function($param1, $param2, $param3, $param4, $param5) {
            this.param1 = $param1;
            this.param2 = $param2;
            this.param3 = $param3;
            this.param4 = $param4;
            this.param5 = $param5;
          };

          var module = pluto.createModule(function(bind) {
            bind('$Root').toConstructor(Root);
            bind('$param1').toInstance('the first injected parameter');
            bind('$param2').toInstance('the second injected parameter');
            bind('$param3').toInstance('the third injected parameter');
            bind('$param4').toInstance('the fourth injected parameter');
            bind('$param5').toInstance('the fifth injected parameter');
          });

          var actual = module.get('$Root');

          expect(actual).toBeDefined();
          expect(actual instanceof Root).toBeTruthy();
          expect(actual.param1).toBe('the first injected parameter');
          expect(actual.param2).toBe('the second injected parameter');
          expect(actual.param3).toBe('the third injected parameter');
          expect(actual.param4).toBe('the fourth injected parameter');
          expect(actual.param5).toBe('the fifth injected parameter');
        });

        it("when the constructor has six parameters, module.get(name) returns the result of new Constructor() with the parameters injected", function() {
          var Root = function($param1, $param2, $param3, $param4, $param5, $param6) {
            this.param1 = $param1;
            this.param2 = $param2;
            this.param3 = $param3;
            this.param4 = $param4;
            this.param5 = $param5;
            this.param6 = $param6;
          };

          var module = pluto.createModule(function(bind) {
            bind('$Root').toConstructor(Root);
            bind('$param1').toInstance('the first injected parameter');
            bind('$param2').toInstance('the second injected parameter');
            bind('$param3').toInstance('the third injected parameter');
            bind('$param4').toInstance('the fourth injected parameter');
            bind('$param5').toInstance('the fifth injected parameter');
            bind('$param6').toInstance('the sixth injected parameter');
          });

          var actual = module.get('$Root');

          expect(actual).toBeDefined();
          expect(actual instanceof Root).toBeTruthy();
          expect(actual.param1).toBe('the first injected parameter');
          expect(actual.param2).toBe('the second injected parameter');
          expect(actual.param3).toBe('the third injected parameter');
          expect(actual.param4).toBe('the fourth injected parameter');
          expect(actual.param5).toBe('the fifth injected parameter');
          expect(actual.param6).toBe('the sixth injected parameter');
        });

        it("when the constructor has seven parameters, module.get(name) returns the result of new Constructor() with the parameters injected", function() {
          var Root = function($param1, $param2, $param3, $param4, $param5, $param6, $param7) {
            this.param1 = $param1;
            this.param2 = $param2;
            this.param3 = $param3;
            this.param4 = $param4;
            this.param5 = $param5;
            this.param6 = $param6;
            this.param7 = $param7;
          };

          var module = pluto.createModule(function(bind) {
            bind('$Root').toConstructor(Root);
            bind('$param1').toInstance('the first injected parameter');
            bind('$param2').toInstance('the second injected parameter');
            bind('$param3').toInstance('the third injected parameter');
            bind('$param4').toInstance('the fourth injected parameter');
            bind('$param5').toInstance('the fifth injected parameter');
            bind('$param6').toInstance('the sixth injected parameter');
            bind('$param7').toInstance('the seventh injected parameter');
          });

          var actual = module.get('$Root');

          expect(actual).toBeDefined();
          expect(actual instanceof Root).toBeTruthy();
          expect(actual.param1).toBe('the first injected parameter');
          expect(actual.param2).toBe('the second injected parameter');
          expect(actual.param3).toBe('the third injected parameter');
          expect(actual.param4).toBe('the fourth injected parameter');
          expect(actual.param5).toBe('the fifth injected parameter');
          expect(actual.param6).toBe('the sixth injected parameter');
          expect(actual.param7).toBe('the seventh injected parameter');
        });

        it("when the constructor has eight parameters, module.get(name) returns the result of new Constructor() with the parameters injected", function() {
          var Root = function($param1, $param2, $param3, $param4, $param5, $param6, $param7, $param8) {
            this.param1 = $param1;
            this.param2 = $param2;
            this.param3 = $param3;
            this.param4 = $param4;
            this.param5 = $param5;
            this.param6 = $param6;
            this.param7 = $param7;
            this.param8 = $param8;
          };

          var module = pluto.createModule(function(bind) {
            bind('$Root').toConstructor(Root);
            bind('$param1').toInstance('the first injected parameter');
            bind('$param2').toInstance('the second injected parameter');
            bind('$param3').toInstance('the third injected parameter');
            bind('$param4').toInstance('the fourth injected parameter');
            bind('$param5').toInstance('the fifth injected parameter');
            bind('$param6').toInstance('the sixth injected parameter');
            bind('$param7').toInstance('the seventh injected parameter');
            bind('$param8').toInstance('the eighth injected parameter');
          });

          var actual = module.get('$Root');

          expect(actual).toBeDefined();
          expect(actual instanceof Root).toBeTruthy();
          expect(actual.param1).toBe('the first injected parameter');
          expect(actual.param2).toBe('the second injected parameter');
          expect(actual.param3).toBe('the third injected parameter');
          expect(actual.param4).toBe('the fourth injected parameter');
          expect(actual.param5).toBe('the fifth injected parameter');
          expect(actual.param6).toBe('the sixth injected parameter');
          expect(actual.param7).toBe('the seventh injected parameter');
          expect(actual.param8).toBe('the eighth injected parameter');
        });

        it("when the constructor has nine parameters, module.get(name) throws an exception", function() {
          var Root = function($param1, $param2, $param3, $param4, $param5, $param6, $param7, $param8, $param9) {};

          var module = pluto.createModule(function(bind) {
            bind('$Root').toConstructor(Root);
          });

          expect(function() {
            module.get('$Root');
          }).toThrow();
        });

      }); // --- / bind(...).toConstructor(...) ---
    });
  });

  describe("Module", function() {
    describe(".get(name)", function() {
      it("throws if the specified name is not mapped", function() {
        var instance = pluto.createModule(function(bind) {});
        expect(function() {
          instance.get('totally bogus key');
        }).toThrow();
      });
    });

    describe(".getAll([names])", function() {

      it("accepts an array of names and returns a matching array of instances", function() {
        var instance = pluto.createModule(function(bind) {
          bind('a').toInstance('A');
          bind('b').toInstance('B');
        });

        var actual = instance.getAll(['a', 'b']);
        expect(actual).toEqual(['A', 'B']);
      });

      it("throws if a name is unmapped", function() {
        var instance = pluto.createModule(function(bind) {
          bind('a').toInstance('A');
        });

        expect(function() {
          instance.getAll(['a', 'totally bogus key']);
        }).toThrow();
      });
    });

    describe(".eagerlyLoadAll", function() {
      it("executes all factory and constructor functions", function() {
        var Constructor = jasmine.createSpy('test Constructor function');
        var factory = jasmine.createSpy('test factory function');

        var instance = pluto.createModule(function(bind) {
          bind('Constructor').toConstructor(Constructor);
          bind('factory').toFactory(factory);
        });

        instance.eagerlyLoadAll();

        expect(Constructor).toHaveBeenCalled();
        expect(factory).toHaveBeenCalled();
      });
    });
  });

});
