var events = require("events"),
    util = require("util");

var Map = require("./map");

var Game = module.exports = function Game(config) {
  events.EventEmitter.call(this);
  this.setMaxListeners(0);

  if (!config) {
    config = {};
  }

  this.clients = [];
  this.players = [];
  this.entities = [];
  this.map = config.map || new Map();

  this.last_eid = 0;

  this.name = config.name || "Minecraft.JS";
  this.max_players = config.max_players || 25;
  this.mode = config.mode || 0;
  this.difficulty = config.difficulty || 0;
  this.admins = config.admins || [];
  this.banned = config.banned || [];

  this.world = {
    type: "flat",
    dimension: 0,
  };

  this.tick = setInterval(this.emit.bind(this, "tick"), 100);
};
util.inherits(Game, events.EventEmitter);

Game.prototype.use = function use(plugin) {
  plugin(this);

  return this;
};

Game.prototype.get_eid = function get_eid() {
  return this.last_eid++;
};

Game.prototype.add_entity = function add_entity(entity) {
  this.entities.push(entity);

  this.emit("entity:added", entity);
  entity.emit("game:added", this);
};

Game.prototype.remove_entity = function remove_entity(entity) {
  var index = this.entities.indexOf(entity);

  if (index !== -1) {
    this.entities.splice(index, 1);
  }

  this.emit("entity:removed", entity);
  entity.emit("game:removed", this);
};

Game.prototype.add_client = function add_client(client) {
  this.clients.push(client);

  this.emit("client:connect", client);
  client.emit("game:connect", this);

  client.on("close", this.remove_client.bind(this, client));
};

Game.prototype.remove_client = function remove_client(client) {
  var index = this.clients.indexOf(client);

  if (index !== -1) {
    this.clients.splice(index, 1);
  }

  this.emit("client:disconnect", client);
  client.emit("game:disconnect", this);
};

Game.prototype.add_player = function add_player(player) {
  this.players.push(player);

  this.emit("player:join", player);
  player.emit("game:join", this);
};

Game.prototype.remove_player = function remove_player(player) {
  var index = this.players.indexOf(player);

  if (index !== -1) {
    this.players.splice(index, 1);
  }

  this.emit("player:leave", player);
  player.emit("game:leave", this);
};

Game.prototype.setGamemode = function(mode) {
  this.mode = mode;
  this.players.forEach(function(player) {
    player.setGamemode(mode);
  });
}