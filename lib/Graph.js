'use strict'

const GraphNode = require('./GraphNode')

module.exports = class Graph {
  constructor() {
    this._internal = {}
    this._internal.nodes = new Map()
  }

  addNode(name) {
    const node = new GraphNode({
      name
    })
    this._internal.nodes.set(name, node)
  }

  getNode(name) {
    return this._internal.nodes.get(name)
  }

  wireChildren(name, childNames) {
    const currentGraphNode = this.getNode(name)
    for (let childName of childNames) {
      const childNode = this.getNode(childName)
      currentGraphNode.addChild(childName, childNode)
    }
  }

  get nodes() {
    const nodes = []
    for (let node of this._internal.nodes.values()) {
        nodes.push(node.toJSON())
    }
    return nodes
  }

  toJSON() {
    return this.nodes
  }
}
