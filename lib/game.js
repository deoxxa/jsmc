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

  this.tick = setInterval(this.emit.bind(this, "tick"), 100);

  this.on("tick", this.update_positions.bind(this));
};
util.inherits(Game, events.EventEmitter);

Game.prototype.update_positions = function update_positions() {
  this.players.filter(function(e) { return Object.keys(e.new_position).length > 0; }).forEach(function(player) {
    console.log("updating position for player " + player.eid);

    var x_delta = typeof player.new_position.x === "number" ? player.new_position.x - player.position.x : 0,
        y_delta = typeof player.new_position.y === "number" ? player.new_position.y - player.position.y : 0,
        z_delta = typeof player.new_position.z === "number" ? player.new_position.z - player.position.z : 0;

    var packet = {
      eid: player.eid,
    };

    if (Math.abs(x_delta) < 4 && Math.abs(y_delta) < 4 && Math.abs(z_delta) < 4) {
      packet.pid   = 0x21;
      packet.x     = x_delta;
      packet.y     = y_delta;
      packet.z     = z_delta;
      packet.yaw   = player.new_position.yaw || player.position.yaw;
      packet.pitch = player.new_position.pitch || player.position.pitch;
    } else {
      packet.pid   = 0x22;
      packet.x     = player.new_position.x;
      packet.y     = player.new_position.y;
      packet.z     = player.new_position.z;
      packet.yaw   = player.new_position.yaw || player.position.yaw;
      packet.pitch = player.new_position.pitch || player.position.pitch;
    }

    this.players.forEach(function(other) {
      other.client.emit("data", packet);
    }.bind(this));

    Object.keys(player.new_position).forEach(function(k) {
      player.position[k] = player.new_position[k];
      delete player.new_position[k];
    });
  }.bind(this));
};

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
    var player = new Player(this.get_eid(), packet.username, {x: Math.random() * 10, y: 10, z: Math.random() * 10, stance: 11.62, yaw: 0, pitch: 0});
    player.client = client;

    this.add_player(player);

    client.on("game:disconnect", function() {
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
      ["yaw", "pitch"].forEach(function(e) {
        if (typeof packet[e] !== "undefined") {
          packet[e] = packet[e] % 360;

          while (packet[e] < 0) {
            packet[e] += 360;
          }
        }
      });

      ["x", "y", "z", "stance", "on_ground", "yaw", "pitch"].forEach(function(k) {
        if (typeof packet[k] !== "undefined" && packet[k] !== player.position[k]) {
          player.new_position[k] = packet[k];
        }
      });

      if (player.new_position.y < -32) {
        player.new_position.y = 10;
        player.new_position.stance = 11.62;
      }
    };

    client.on("packet:0a", on_move);
    client.on("packet:0b", on_move);
    client.on("packet:0c", on_move);
    client.on("packet:0d", on_move);

    client.on("packet:03", function(packet) {
      this.players.forEach(function(player) {
        player.client.emit("data", {pid: 0x03, message: "<" + player.name + "> " + packet.message});
      });
    }.bind(this));

    var sent_chunks = 0;
    for (var x=-7;x<=7;++x) {
      for (var z=-7;z<=7;++z) {
        (function(x, z) {
          this.map.get_chunk(x, z, function(err, chunk) {
            zlib.deflate(chunk.data_for_network(), function(err, data) {
              client.emit("data", {pid: 0x33, x: x, z: z, solid: 1, primary_bitmap: 15, add_bitmap: 15, data: data});

              sent_chunks++;

              if (sent_chunks === 49) {
                client.emit("data", {pid: 0x06, x: 0, y: 10, z: 0});

                client.emit("data", {
                  pid: 0x0d,
                  x: player.position.x,
                  y: player.position.y,
                  z: player.position.z,
                  stance: player.position.stance,
                  yaw: player.position.yaw,
                  pitch: player.position.pitch,
                  on_ground: player.position.on_ground,
                });

                this.players.forEach(function(other_player) {
                  if (player === other_player) { return; }

                  client.emit("data", {
                    pid: 0x14,
                    eid: other_player.eid,
                    name: other_player.name.substr(0, 14),
                    x: other_player.position.x,
                    y: other_player.position.y,
                    z: other_player.position.z,
                    yaw: other_player.position.yaw,
                    pitch: other_player.position.pitch,
                    current_item: 0,
                    metadata: [["int", 8, 0]],
                  });

                  other_player.client.emit("data", {
                    pid: 0x14,
                    eid: player.eid,
                    name: player.name.substr(0, 14),
                    x: player.position.x,
                    y: player.position.y,
                    z: player.position.z,
                    yaw: player.position.yaw,
                    pitch: player.position.pitch,
                    current_item: 0,
                    metadata: [["int", 8, 0]],
                  });
                });
              }
            }.bind(this));
          }.bind(this));
       }.bind(this))(x, z);
      }
    }
  }.bind(this));

  this.emit("client:connect", client);
  client.emit("game:connect", this);
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
