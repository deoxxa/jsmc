#!/usr/bin/env node

// This is an example `server.js`! It shows you how jsmc allows you to very
// heavily customise your server in an easy to manage way.
//
// This server just does the basics and shows off the included plugins.

// nconf and optimist are external libraries that make configuration easy. You
// can replace these with any other library you want though - it's all up to
// you.

var nconf = require("nconf"),
    optimist = require("optimist");

nconf.argv();
optimist.argv._.reverse().concat(["config.json"]).forEach(function(file) { nconf.file(file.toLowerCase().replace(/[^a-z0-9]+/g, "_"), file); });
nconf.defaults({
  server: {
    port: 25565,
  },
  game: {
    name: "Another jsmc server",
    mode: 1,
    max_players: 25,
    difficulty: 0,
  },
});

// This is the `Game` object. It's (probably) the core of your server. It holds
// a lot of the wiring between different components.
var Game = require("./lib/game");

var game = new Game({
  name: nconf.get("game:name"),
  mode: nconf.get("game:mode"),
  max_players: nconf.get("game:max_players"),
  difficulty: nconf.get("game:difficulty")
});

// Load some plugins

// This plugin provides the server ping functionality for reporting server
// status in the "Play Multiplayer" screen of Minecraft.
var ServerPingPlugin = require("./plugins/server-ping");
ServerPingPlugin(game);

// This plugin handles login for players, creating a new Player object,
// attaching it to a client and finally adding it to the active Game object.
var LoginPlugin = require("./plugins/login");
LoginPlugin(game);

// This plugin handles chat messages between players.
var ChatPlugin = require("./plugins/chat");
ChatPlugin(game);

// This plugin handles... You guessed it, digging!
var DiggingPlugin = require("./plugins/digging"),
DiggingPlugin(game);

// This plugin does all the setup of a player to get them into the world. This
// includes things like setting their initial spawn position, sending them a
// bunch of chunks to get started, telling them about other players connected,
// etc.
var InitialSpawnPlugin = require("./plugins/intial-spawn");
InitialSpawnPlugin(game);

// This plugin displays chat messages when players join or leave the game.
var JoinPartPlugin = require("./plugins/join-part");
JoinPartPlugin(game);

// This plugin handles movement of players. It keeps track of their position,
// sends the information to other players, and so on.
var MovementPlugin = require("./plugins/movement");
MovementPlugin(game);

// This plugin sends periodic ping messages to connected players, to make sure
// they don't time out.
var PingPlugin = require("./plugins/ping");
PingPlugin(game);

// This plugin provides a `/suicide` command for players to kill themselves.
// It's largely used for debugging or getting yourself out of a wall...
var RespawnPlugin = require("./plugins/respawn");
RespawnPlugin(game);

// Generate the spawn area so the first player to join doesn't have to sit
// around like an idiot waiting while they log in.
for (var x = -7; x <= 7; ++x) {
  for (var y = -7; y <= 7; ++y) {
    (function(x, y) {
      game.map.get_chunk(x, y, function(err, chunk) {
        console.log("chunk " + [x, y].join(",") + " is done");
      });
    }(x, y));
  }
}

// The server object is basically a wrapper around `net.Server` that constructs
// `Client` objects as they connect.

var Server = require("./lib/server");

// Here's a server instance! Note that you're not limited to one. Feel free to
// create as many as you want and wire them all up to the same `Game` object.
// Or different objects. I'm not here to judge you.

var server = new Server();

// This is how you wire a `Server` up to a `Game`.

server.on("client:connect", game.add_client.bind(game));

// These listeners are really just for convenience and some info for the person
// running the server.

server.on("server:listening", function() {
  console.log("listening");
});

server.on("server:close", function() {
  console.log("closed");
});

// And here's the final point of setup - opening up the server so people can
// connect!

server.listen(nconf.get("server:port"), nconf.get("server:host"));
