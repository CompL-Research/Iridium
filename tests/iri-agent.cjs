"use strict";

const D8Agent = require("eshost/lib/agents/d8");

module.exports = class IRIAgent extends D8Agent {
  constructor(options) {
    super({ shortName: "$262", ...options });
  }
};
