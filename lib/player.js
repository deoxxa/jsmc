var events = require("events"),
    util = require("util");

var Player = module.exports = function Player(client, game, name, position) {
  events.EventEmitter.call(this);

  this.client = client;
  this.game = game;
  this.eid = game.get_eid();
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

Player.prototype.message = function(msg, colour) {
  if(colour) {
    msg = "§" + colour + msg;
  }
  this.client.emit("data", {pid: 0x03, message: msg});
};

Player.prototype.kick = function(msg) {
  this.client.emit("data", {pid: 0xff, message: msg || "You were kicked from the server." });
};

Player.prototype.setHealth = function(health, food, saturation) {
  this.client.emit("data", {pid: 0x08, 'health': health, 'food': food, 'saturation': saturation || 5});
};

Player.prototype.kill = function() {
  this.setHealth(0, 0, 0);
};

Player.prototype.respawn = function() {
  this.client.emit("data", {pid: 0x09, dimension: this.game.world.dimension, difficulty: this.game.difficulty, game_mode: this.game.mode, world_height: 256, level_type: this.game.world.type});
};
