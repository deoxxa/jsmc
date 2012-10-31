var events = require("events"),
    util = require("util");

var Player = module.exports = function Player(client, eid, name, position) {
  events.EventEmitter.call(this);

  this.client = client;
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

  /* Helper functions */

  var self = this;

  this.message = function(msg) {
    client.emit("data", {pid: 0x03, message: msg });
  }

  this.kick = function(msg) {
    client.emit("data", {pid: 0xff, message: msg });
  }

  this.setHealth = function(health, food, saturation) {
    client.emit("data", {pid: 0x08, 'health': health, 'food': food, 'saturation': saturation || 5 });
  }

  this.kill = function() {
    this.setHealth(0, 0, 0);
  }

  this.respawn = function() {
    client.emit("data", {pid: 0x09, dimension: 0, difficulty: 1, gamemode: 0, world_height: 256, level_type: "flat" });
  }

  client.on("packet:03", function(packet) {
    var tmp = packet.message.split(" ");
    if(tmp[0]=="/suicide") {
      self.kill();
    }
  });

  client.on("packet:cd", function(packet) {
    if(packet.payload) {
      self.respawn();
    }
  });

  /* End Helper functions */

  if (typeof position === "object" && position !== null) {
    Object.keys(position).forEach(function(k) {
      this.position[k] = position[k];
    }.bind(this));
  }
};
util.inherits(Player, events.EventEmitter);
