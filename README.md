Pluto.js: JavaScript Dependency Injection
=========================================

What is Pluto?
--------------
Pluto is a JavaScript dependency injection tool.

Dependency injection is a spiffy way to assemble your applications. It decouples the various bits and makes your app testable. An introduction to dependency injection principles is currently beyond the scope of this guide.

How to Pluto?
-------------
A module is the basic unit of Pluto's dependency injection. It maps names to objects you want.

Pluto's injection is done in two steps. First, create a module. When you do this, you bind names to any combination of objects, factory functions and constructor functions. Second, call module.get(...) and pass a name. Pluto will give you the thing mapped to that name. Along the way, it will inject parameters that match other names bound in the module.

There are three things you can bind to a name: an object instance, a constructor function and a factory function.

The simplest binding is to bind a name to an instance:

```  js
var myInstance = {}; // can be any JavaScript object
var module = Module.create(function (bind) {
  bind("anInstance").to(myInstance);
};

var theInstance = module.get("anInstance"); // theInstance is myInstance
```

You can also bind to a constructor function (i.e., a function that is meant to be used with the "new" keyword to create a new object). When you call module.get(...), Pluto will invoke the Constructor using "new" and return the result. If the constructor has any parameters, Pluto will consult its bindings and pass them into the constructor:

```  js
var myGreeting = "Hello, world";
var Greeter = function (greeting) {
  this.greeting = greeting;
};

Greeter.prototype.greet = function () {
  console.log(this.greeting);
}

var module = Module.create(function (bind) {
  bind("greeting").toInstance(myGreeting);
  bind("greeter").toConstructor(Greeter);
};

var theGreeter = module.get("greeter");
theGreeter.greet(); //prints, "Hello, world!"
```

Similarly, you can bind to a factory function -- that is, a function that creates some other object. When you call module.get(...), Pluto will invoke the function and return the result. Just like with a constructor, if the factory function has any parameters, Pluto will consult its bindings and pass them into the factory:

```  js
var myGreeting = "Hello, world";
var myFactory = function (greeting) {
  // if this bit of code confuses you, Google, "JavaScript currying." ;-)
  return function () {
    console.log(greeting);
  }
};

var module = Module.create(function (bind) {
  bind("greeting").toInstance(myGreeting);
  bind("greeter").toFactory(myFactory);
};

var theGreeter = module.get("greeter");
theGreeter(); //prints, "Hello, world!"
```