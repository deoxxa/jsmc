var events = require("events"),
    util = require("util"),
    zlib = require("zlib");

var Player = require("./player"),
    Map = require("./map");

var Game = module.exports = function Game() {
  events.EventEmitter.call(this);

  this.clients = [];
  this.players = [];
  this.map = new Map();

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

  var ping_interval = setInterval(function() {
    client.emit("data", {pid: 0x00, token: 0});
  }, 1000);
  client.on("close", function() { clearInterval(ping_interval); });

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

    var on_move = function on_move(packet) {
      ["x", "y", "z", "stance", "on_ground", "yaw", "pitch"].forEach(function(k) {
        if (typeof packet[k] !== "undefined") {
          player.position[k] = packet[k];
        }
      });

      if (player.position.y < -32) {
        player.position.y = 20;
        player.position.stance = 21.62;
      }
    };

    client.on("packet:0a", on_move);
    client.on("packet:0b", on_move);
    client.on("packet:0c", on_move);
    client.on("packet:0d", on_move);

    var sent_chunks = 0;
    for (var x=-7;x<=7;++x) {
      for (var z=-7;z<=7;++z) {
        (function(x, z) {
          this.map.get_chunk(x, z, function(err, chunk) {
            zlib.deflate(chunk.data_for_network(), function(err, data) {
              client.emit("data", {pid: 0x33, x: x, z: z, solid: 1, primary_bitmap: 15, add_bitmap: 15, data: data});

              sent_chunks++;

              if (sent_chunks === 49) {
                client.emit("data", {pid: 0x06, x: 0, y: 20, z: 0});
                client.emit("data", {pid: 0x0d, x: 0, y: 20, z: 0, stance: 21.62, yaw: 0, pitch: 0, on_ground: 1});
              }
            });
          });
       }.bind(this))(x, z);
      }
    }
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
