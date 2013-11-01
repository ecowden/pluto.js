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
var anInstance = {}; // can be any JavaScript object
var module = pluto.createModule(function (bind) {
  bind("myInstance").toInstance(anInstance);
});

var plutosInstance = module.get("myInstance"); // plutosInstance is anInstance
```

You can also bind to a constructor function (i.e., a function that is meant to be used with the "new" keyword to create a new object). When you call module.get(...), Pluto will invoke the Constructor using "new" and return the result. If the constructor has any parameters, Pluto will consult its bindings and pass them into the constructor:

```  js
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
console.log(theGreeter.greet()); //prints, "Hello, world!"
```

Similarly, you can bind to a factory function -- that is, a function that creates some other object. When you call module.get(...), Pluto will invoke the function and return the result. Just like with a constructor, if the factory function has any parameters, Pluto will consult its bindings and pass them into the factory:

```  js
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
console.log(theGreeter()); //prints, "Hello, world!"
```

Injected objects are singletons
-------------------------------

Note that a factory function or constructor function is only called once. Each call to `get(...)` will return the
same instance.

Remember that singletons are only singletons within a single module, though. Different module instances -- for instance,
created for separate test methods -- will each have their own singleton instance.

