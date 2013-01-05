var Entity = require("./entity"),
    util = require("util");

var Player = module.exports = function Player(game, options) {
  Entity.apply(this, arguments);

  this.client = this.options.client;
  this.name = this.options.name;

  this.admin = false;
  this.mode = game.mode;

  this.stance = 0;
  this.on_ground = 1;

  this.health = 20;
  this.food = 20;
  this.saturation = 5;

  if (typeof this.options.stance    === "number") { this.stance    = this.options.stance;    }
  if (typeof this.options.on_ground === "number") { this.on_ground = this.options.on_ground; }
};
util.inherits(Player, Entity);

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
  this.client.emit("data", {pid: 0x09, dimension: this.game.world.dimension, difficulty: this.game.difficulty, game_mode: this.mode, world_height: 256, level_type: this.game.world.type});
};

Player.prototype.isAdmin = function() {
  return this.admin;
};

Player.prototype.setGamemode = function(mode) {
  this.mode = mode;
  this.client.emit("data", {pid: 0x46, reason: 3, game_mode: mode });
};