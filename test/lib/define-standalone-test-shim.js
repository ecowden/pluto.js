function define(dependencies, factory) {
    if (dependencies.length !== 2) {
        throw "A test should have two dependencies: 'underscore' and 'pluto'";
    }
    if (dependencies[0] !== "underscore") {
        throw "The first dependency in a spec should be 'underscore'";
    }
    if (dependencies[1] !== "pluto") {
        throw "The second dependency in a spec should be 'pluto'";
    }

    factory(_, pluto);
}