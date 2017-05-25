'use strict'

const builtInObjectNames = ['plutoBinder', 'plutoApp', 'plutoGraph']

module.exports = class GraphNode {
  constructor(opts) {
    this._internal = {}
    this._internal.name = opts.name
    this._internal.parents = new Map()
    this._internal.children = new Map()
  }

  addChild(name, node) {
    // wire up relationship bi-directionally
    this._internal.children.set(name, node)
    node._internal.parents.set(this.name, this)
  }

  get name() {
    return this._internal.name
  }

  get parents() {
    return this._internal.parents
  }
  get children() {
    return this._internal.children
  }

  // return true if this is a component built in to pluto, like the plutoBinder
  get isBuiltIn() {
    return builtInObjectNames.indexOf(this._internal.name) >= 0
  }

  set bindingStrategy(bindingStrategy) {
    this._internal.bindingStrategy = bindingStrategy
  }

  get bindingStrategy() {
    return this._internal.bindingStrategy
  }

  toJSON() {
    const o = {
      name: this._internal.name,
      parents: [],
      children: [],
      bindingStrategy: this.bindingStrategy,
      isBuiltIn: this.isBuiltIn
    }

    for (let name of this._internal.children.keys()) {
      o.children.push(name)
    }
    for (let name of this._internal.parents.keys()) {
      o.parents.push(name)
    }
    return o
  }
}
