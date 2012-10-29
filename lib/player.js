var events = require("events"),
    util = require("util");

var Player = module.exports = function Player(eid, name) {
  events.EventEmitter.call(this);

  this.eid = eid;
  this.name = name;

  this.position = {
    x: 0,
    y: 0,
    z: 0,
    stance: 0,
    yaw: 0,
    pitch: 0,
    on_ground: 1,
  };
};
util.inherits(Player, events.EventEmitter);
