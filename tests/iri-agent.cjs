"use strict";

const NodeAgent = require("eshost/lib/agents/node");

module.exports = class IRIAgent extends NodeAgent {
  constructor(options) {
    super({ shortName: "$262", ...options });
  }
};
