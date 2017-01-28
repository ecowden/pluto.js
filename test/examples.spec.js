var pluto = require('../lib/pluto')
var expect = require('chai').expect

describe('examples', function () {
  it('bind to instance', function () {
    var anInstance = {} // can be any JavaScript object
    var module = pluto.createModule(function (bind) {
      bind('myInstance').toInstance(anInstance)
    })

    expect(module.get('myInstance')).to.eql(anInstance)
  })

  it('bind to constructor', function () {
    var aGreeting = 'Hello, world!'
    var Greeter = function (greeting) {
      this.greeting = greeting
    }

    Greeter.prototype.greet = function () {
      return this.greeting
    }

    var module = pluto.createModule(function (bind) {
      bind('greeting').toInstance(aGreeting)
      bind('greeter').toConstructor(Greeter)
    })

    var theGreeter = module.get('greeter')

    expect(theGreeter.greet()).to.eql('Hello, world!')
  })

  it('bind to factory function', function () {
    var aGreeting = 'Hello, world!'
    var greeterFactory = function (greeting) {
      return function () {
        return greeting
      }
    }

    var module = pluto.createModule(function (bind) {
      bind('greeting').toInstance(aGreeting)
      bind('greeter').toFactory(greeterFactory)
    })

    var theGreeter = module.get('greeter')

    expect(theGreeter()).to.eql('Hello, world!')
  })
})
