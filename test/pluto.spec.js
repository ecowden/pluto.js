const expect = require('chai').expect

const pluto = require('../lib/pluto')

describe('pluto', function () {
  describe('pluto.createModule( ... )', function () {
    it('invokes the callback passed as the first parameter with a "bind" parameter', function () {
      let actualBind

      pluto.createModule(function (bind) {
        actualBind = bind
      })

      expect(actualBind).to.be.defined
    })

    describe('bind(name) ...', function () {
      describe('.toInstance(instance)', function () {
        it('throws if instance parameter is null', function () {
          expect(function () {
            pluto.createModule(function (bind) {
              bind('$injected').toInstance(null)
            })
          }).to.throw(Error)
        })

        it('throws if instance parameter is undefined', function () {
          expect(function () {
            pluto.createModule(function (bind) {
              bind('$injected').toInstance(undefined)
            })
          }).to.throw(Error)
        })

        it('throws if a mapping with the given name already exists', function () {
          expect(function () {
            pluto.createModule(function (bind) {
              bind('$injected').toInstance({})
              bind('$injected').toInstance({})
            })
          }).to.throw(Error)
        })

        it('module.get(name) returns the instance', function () {
          const expected = {}
          const module = pluto.createModule(function (bind) {
            bind('$injected').toInstance(expected)
          })

          const actual = module.get('$injected')
          expect(actual).to.eql(expected)
        })
      })
      // --- / bind(...).toInstance(...) ---

      describe('.toFactory(factory)', function () {
        it('throws if factory parameter is null', function () {
          expect(function () {
            pluto.createModule(function (bind) {
              bind('$injected').toFactory(null)
            })
          }).to.throw(Error)
        })

        it('throws if factory parameter is undefined', function () {
          expect(function () {
            pluto.createModule(function (bind) {
              bind('$injected').toFactory(undefined)
            })
          }).to.throw(Error)
        })

        it('throws if a mapping with the given name already exists', function () {
          const factory = function () {}

          expect(function () {
            pluto.createModule(function (bind) {
              bind('$injected').toFactory(factory)
              bind('$injected').toFactory(factory)
            })
          }).to.throw(Error)
        })

        it('throws if the factory is not a function', function () {
          expect(function () {
            pluto.createModule(function (bind) {
              bind('$injected').toFactory({})
            })
          }).to.throw(Error)
        })

        it('when the factory has zero parameters, module.get(name) returns the result of the factory\'s invocation', function () {
          const expected = {}

          function factory() {
            return expected
          }

          const module = pluto.createModule(function (bind) {
            bind('$injected').toFactory(factory)
          })

          const actual = module.get('$injected')
          expect(actual).to.eql(expected)
        })

        it('module.get(name) injects the factory function\'s parameters, then returns the result from the factory\'s invocation', function () {
          const expectedParam = {}

          function factory($param) {
            return {
              param: $param
            }
          }

          const module = pluto.createModule(function (bind) {
            bind('$root').toFactory(factory)
            bind('$param').toInstance(expectedParam)
          })

          const actual = module.get('$root')
          expect(actual.param).to.eql(expectedParam)
        })

        it('memoizes invocation so that the factory function is only invoked once', function () {
          let invocationCount = 0

          function factory() {
            invocationCount++
            return 'dummy'
          }

          const module = pluto.createModule(function (bind) {
            bind('$factory').toFactory(factory)
          })

          module.get('$factory')
          module.get('$factory')

          expect(invocationCount).to.eql(1)
        })
      }) // --- / bind(...).toFactory(...) ---

      describe('.toConstructor(Constructor)', function () {
        it('throws if constructor parameter is null', function () {
          expect(function () {
            pluto.createModule(function (bind) {
              bind('$injected').toConstructor(null)
            })
          }).to.throw(Error)
        })

        it('throws if factory parameter is undefined', function () {
          expect(function () {
            pluto.createModule(function (bind) {
              bind('$injected').toConstructor(undefined)
            })
          }).to.throw(Error)
        })

        it('throws if a mapping with the given name already exists', function () {
          const Constructor = function () {}

          expect(function () {
            pluto.createModule(function (bind) {
              bind('$injected').toConstructor(Constructor)
              bind('$injected').toConstructor(Constructor)
            })
          }).to.throw(Error)
        })

        it('throws if the constructor is not a function', function () {
          expect(function () {
            pluto.createModule(function (bind) {
              bind('$injected').toConstructor({})
            })
          }).to.throw(Error)
        })

        it('when the constructor has zero parameters, module.get(name) returns the result of new Constructor()', function () {
          const Constructor = function () {}

          const module = pluto.createModule(function (bind) {
            bind('$injected').toConstructor(Constructor)
          })

          const actual = module.get('$injected')

          expect(actual).to.be.defined
          expect(actual instanceof Constructor).to.be.ok
        })

        it('when the constructor has one parameter, module.get(name) returns the result of new Constructor() with the parameter injected', function () {
          const Root = function ($param1) {
            this.param1 = $param1
          }

          const module = pluto.createModule(function (bind) {
            bind('$Root').toConstructor(Root)
            bind('$param1').toInstance('the first injected parameter')
          })

          const actual = module.get('$Root')

          expect(actual).to.be.defined
          expect(actual instanceof Root).to.be.ok
          expect(actual.param1).to.eql('the first injected parameter')
        })

        it('when the constructor has two parameters, module.get(name) returns the result of new Constructor() with the parameters injected', function () {
          const Root = function ($param1, $param2) {
            this.param1 = $param1
            this.param2 = $param2
          }

          const module = pluto.createModule(function (bind) {
            bind('$Root').toConstructor(Root)
            bind('$param1').toInstance('the first injected parameter')
            bind('$param2').toInstance('the second injected parameter')
          })

          const actual = module.get('$Root')

          expect(actual).to.be.defined
          expect(actual instanceof Root).to.be.ok
          expect(actual.param1).to.eql('the first injected parameter')
          expect(actual.param2).to.eql('the second injected parameter')
        })

        it('when the constructor has three parameters, module.get(name) returns the result of new Constructor() with the parameters injected', function () {
          const Root = function ($param1, $param2, $param3) {
            this.param1 = $param1
            this.param2 = $param2
            this.param3 = $param3
          }

          const module = pluto.createModule(function (bind) {
            bind('$Root').toConstructor(Root)
            bind('$param1').toInstance('the first injected parameter')
            bind('$param2').toInstance('the second injected parameter')
            bind('$param3').toInstance('the third injected parameter')
          })

          const actual = module.get('$Root')

          expect(actual).to.be.defined
          expect(actual instanceof Root).to.be.ok
          expect(actual.param1).to.eql('the first injected parameter')
          expect(actual.param2).to.eql('the second injected parameter')
          expect(actual.param3).to.eql('the third injected parameter')
        })

        it('when the constructor has four parameters, module.get(name) returns the result of new Constructor() with the parameters injected', function () {
          const Root = function ($param1, $param2, $param3, $param4) {
            this.param1 = $param1
            this.param2 = $param2
            this.param3 = $param3
            this.param4 = $param4
          }

          const module = pluto.createModule(function (bind) {
            bind('$Root').toConstructor(Root)
            bind('$param1').toInstance('the first injected parameter')
            bind('$param2').toInstance('the second injected parameter')
            bind('$param3').toInstance('the third injected parameter')
            bind('$param4').toInstance('the fourth injected parameter')
          })

          const actual = module.get('$Root')

          expect(actual).to.be.defined
          expect(actual instanceof Root).to.be.ok
          expect(actual.param1).to.eql('the first injected parameter')
          expect(actual.param2).to.eql('the second injected parameter')
          expect(actual.param3).to.eql('the third injected parameter')
          expect(actual.param4).to.eql('the fourth injected parameter')
        })

        it('when the constructor has five parameters, module.get(name) returns the result of new Constructor() with the parameters injected', function () {
          const Root = function ($param1, $param2, $param3, $param4, $param5) {
            this.param1 = $param1
            this.param2 = $param2
            this.param3 = $param3
            this.param4 = $param4
            this.param5 = $param5
          }

          const module = pluto.createModule(function (bind) {
            bind('$Root').toConstructor(Root)
            bind('$param1').toInstance('the first injected parameter')
            bind('$param2').toInstance('the second injected parameter')
            bind('$param3').toInstance('the third injected parameter')
            bind('$param4').toInstance('the fourth injected parameter')
            bind('$param5').toInstance('the fifth injected parameter')
          })

          const actual = module.get('$Root')

          expect(actual).to.be.defined
          expect(actual instanceof Root).to.be.ok
          expect(actual.param1).to.eql('the first injected parameter')
          expect(actual.param2).to.eql('the second injected parameter')
          expect(actual.param3).to.eql('the third injected parameter')
          expect(actual.param4).to.eql('the fourth injected parameter')
          expect(actual.param5).to.eql('the fifth injected parameter')
        })

        it('when the constructor has six parameters, module.get(name) returns the result of new Constructor() with the parameters injected', function () {
          const Root = function ($param1, $param2, $param3, $param4, $param5, $param6) {
            this.param1 = $param1
            this.param2 = $param2
            this.param3 = $param3
            this.param4 = $param4
            this.param5 = $param5
            this.param6 = $param6
          }

          const module = pluto.createModule(function (bind) {
            bind('$Root').toConstructor(Root)
            bind('$param1').toInstance('the first injected parameter')
            bind('$param2').toInstance('the second injected parameter')
            bind('$param3').toInstance('the third injected parameter')
            bind('$param4').toInstance('the fourth injected parameter')
            bind('$param5').toInstance('the fifth injected parameter')
            bind('$param6').toInstance('the sixth injected parameter')
          })

          const actual = module.get('$Root')

          expect(actual).to.be.defined
          expect(actual instanceof Root).to.be.ok
          expect(actual.param1).to.eql('the first injected parameter')
          expect(actual.param2).to.eql('the second injected parameter')
          expect(actual.param3).to.eql('the third injected parameter')
          expect(actual.param4).to.eql('the fourth injected parameter')
          expect(actual.param5).to.eql('the fifth injected parameter')
          expect(actual.param6).to.eql('the sixth injected parameter')
        })

        it('when the constructor has seven parameters, module.get(name) returns the result of new Constructor() with the parameters injected', function () {
          const Root = function ($param1, $param2, $param3, $param4, $param5, $param6, $param7) {
            this.param1 = $param1
            this.param2 = $param2
            this.param3 = $param3
            this.param4 = $param4
            this.param5 = $param5
            this.param6 = $param6
            this.param7 = $param7
          }

          const module = pluto.createModule(function (bind) {
            bind('$Root').toConstructor(Root)
            bind('$param1').toInstance('the first injected parameter')
            bind('$param2').toInstance('the second injected parameter')
            bind('$param3').toInstance('the third injected parameter')
            bind('$param4').toInstance('the fourth injected parameter')
            bind('$param5').toInstance('the fifth injected parameter')
            bind('$param6').toInstance('the sixth injected parameter')
            bind('$param7').toInstance('the seventh injected parameter')
          })

          const actual = module.get('$Root')

          expect(actual).to.be.defined
          expect(actual instanceof Root).to.be.ok
          expect(actual.param1).to.eql('the first injected parameter')
          expect(actual.param2).to.eql('the second injected parameter')
          expect(actual.param3).to.eql('the third injected parameter')
          expect(actual.param4).to.eql('the fourth injected parameter')
          expect(actual.param5).to.eql('the fifth injected parameter')
          expect(actual.param6).to.eql('the sixth injected parameter')
          expect(actual.param7).to.eql('the seventh injected parameter')
        })

        it('when the constructor has eight parameters, module.get(name) returns the result of new Constructor() with the parameters injected', function () {
          const Root = function ($param1, $param2, $param3, $param4, $param5, $param6, $param7, $param8) {
            this.param1 = $param1
            this.param2 = $param2
            this.param3 = $param3
            this.param4 = $param4
            this.param5 = $param5
            this.param6 = $param6
            this.param7 = $param7
            this.param8 = $param8
          }

          const module = pluto.createModule(function (bind) {
            bind('$Root').toConstructor(Root)
            bind('$param1').toInstance('the first injected parameter')
            bind('$param2').toInstance('the second injected parameter')
            bind('$param3').toInstance('the third injected parameter')
            bind('$param4').toInstance('the fourth injected parameter')
            bind('$param5').toInstance('the fifth injected parameter')
            bind('$param6').toInstance('the sixth injected parameter')
            bind('$param7').toInstance('the seventh injected parameter')
            bind('$param8').toInstance('the eighth injected parameter')
          })

          const actual = module.get('$Root')

          expect(actual).to.be.defined
          expect(actual instanceof Root).to.be.ok
          expect(actual.param1).to.eql('the first injected parameter')
          expect(actual.param2).to.eql('the second injected parameter')
          expect(actual.param3).to.eql('the third injected parameter')
          expect(actual.param4).to.eql('the fourth injected parameter')
          expect(actual.param5).to.eql('the fifth injected parameter')
          expect(actual.param6).to.eql('the sixth injected parameter')
          expect(actual.param7).to.eql('the seventh injected parameter')
          expect(actual.param8).to.eql('the eighth injected parameter')
        })

        it('when the constructor has nine parameters, module.get(name) throws an exception', function () {
          const Root = function ($param1, $param2, $param3, $param4, $param5, $param6, $param7, $param8, $param9) {}

          const module = pluto.createModule(function (bind) {
            bind('$Root').toConstructor(Root)
          })

          expect(function () {
            module.get('$Root')
          }).to.throw(Error)
        })
      }) // --- / bind(...).toConstructor(...) ---
    })
  })

  describe('Module', function () {
    describe('.get(name)', function () {
      it('throws if the specified name is not mapped', function () {
        const instance = pluto.createModule(function () {})
        expect(function () {
          instance.get('totally bogus key')
        }).to.throw(Error)
      })
    })

    describe('.getAll([names])', function () {
      it('accepts an array of names and returns a matching array of instances', function () {
        const instance = pluto.createModule(function (bind) {
          bind('a').toInstance('A')
          bind('b').toInstance('B')
        })

        const actual = instance.getAll(['a', 'b'])
        expect(actual).to.eql(['A', 'B'])
      })

      it('throws if a name is unmapped', function () {
        const instance = pluto.createModule(function (bind) {
          bind('a').toInstance('A')
        })

        expect(function () {
          instance.getAll(['a', 'totally bogus key'])
        }).to.throw(Error)
      })
    })

    describe('.eagerlyLoadAll', function () {
      it('executes all factory and constructor functions', function () {
        let constructorCalled = false
        let factoryCalled = false

        const instance = pluto.createModule(function (bind) {
          bind('Constructor').toConstructor(function FakeConstructor() {
            constructorCalled = true
          })
          bind('factory').toFactory(function fakeFactory() {
            factoryCalled = true
          })
        })

        instance.eagerlyLoadAll()

        expect(constructorCalled).to.be.true
        expect(factoryCalled).to.be.true
      })
    })
  })
})
