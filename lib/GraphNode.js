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
    return this._internal.parents // TODO should this return a copy?
  }
  get children() {
    return this._internal.children // TODO should this return a copy?
  }

  // a "Root" node has no parents
  get isRoot() {
    return this._internal.parents.size === 0
  }

  // a "Leaf" node is a node with no children
  get isLeaf() {
    return this._internal.children.size === 0
  }

  // return true if this is a component built in to pluto, like the plutoBinder
  get isBuiltIn() {
    return builtInObjectNames.includes(this._internal.name)
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
      isRoot: this.isRoot,
      isLeaf: this.isLeaf,
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
