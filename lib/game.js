var events = require("events"),
    util = require("util");

var Player = require("./player");

var Game = module.exports = function Game() {
  events.EventEmitter.call(this);

  this.clients = [];
  this.players = [];

  this.last_eid = 0;

  this.name = "Minecraft.JS";
  this.max_players = 25;
  this.mode = 0;
  this.difficulty = 0;

  this.world = {
    type: "flat",
    dimension: 0,
  };
};
util.inherits(Game, events.EventEmitter);

Game.prototype.get_eid = function get_eid() {
  return this.last_eid++;
};

Game.prototype.add_client = function add_client(client) {
  this.clients.push(client);

  client.on("close", this.remove_client.bind(this, client));

  client.on("packet:fe", function(packet) {
    client.emit("data", {
      pid: 0xff,
      message: ["§1", "47", "1.4.2", this.name, this.players.length, this.max_players].join("\x00"),
    });

    client.end();
  }.bind(this));

  client.on("packet:02", function(packet) {
    var player = new Player(this.get_eid(), packet.username);

    this.add_player(player);

    this.on("client:disconnect", function(e) {
      if (e !== client) { return; }
      this.remove_player(player);
    }.bind(this));

    client.emit("data", {
      pid: 0x01,
      eid: player.eid,
      level_type: this.world.type,
      game_mode: this.mode,
      dimension: this.world.dimension,
      difficulty: this.difficulty,
      junk: 0,
      max_players: this.max_players,
    });

    for (var x=-7;x<=7;++x) {
      for (var z=-7;z<=7;++z) {
        client.emit("data", {
          pid: 0x33,
          x: x,
          z: z,
          solid: 1,
          primary_bitmap: 15,
          add_bitmap: 0,
          data: new Buffer("789cedc101010000080220ff9f2edb1190000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000070060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002acf2dea870ef2", "hex"),
        });
      }
    }

    client.emit("data", {
      pid: 0x06,
      x: 0,
      y: 64,
      z: 0,
    });

    client.emit("data", {
      pid: 0x0d,
      x: 0,
      y: 64,
      z: 0,
      stance: 65.62,
      yaw: 0,
      pitch: 0,
      on_ground: 1,
    });
  }.bind(this));

  this.emit("client:connect", client);
};

Game.prototype.remove_client = function remove_client(client) {
  var index = this.clients.indexOf(client);

  if (index !== -1) {
    this.clients.splice(index, 1);
  }

  this.emit("client:disconnect", client);
};

Game.prototype.add_player = function add_player(player) {
  this.players.push(player);

  this.emit("player:join", player);
};

Game.prototype.remove_player = function remove_player(player) {
  var index = this.players.indexOf(player);

  if (index !== -1) {
    this.players.splice(index, 1);
  }

  this.emit("player:leave", player);
};
