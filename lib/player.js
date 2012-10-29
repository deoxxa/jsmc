var events = require("events"),
    util = require("util");

var Player = module.exports = function Player(eid, name) {
  events.EventEmitter.call(this);

  this.eid = eid;
  this.name = name;
};
util.inherits(Player, events.EventEmitter);
