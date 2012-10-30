var events = require("events"),
    util = require("util");

var Player = module.exports = function Player(eid, name, position) {
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
  this.new_position = {};

  if (typeof position === "object" && position !== null) {
    Object.keys(position).forEach(function(k) {
      this.position[k] = position[k];
    }.bind(this));
  }
};
util.inherits(Player, events.EventEmitter);
