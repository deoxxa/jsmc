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

// This is the `Map` object. It keeps a list of routines that generate your map.
var Map = require("./lib/map");

var map = new Map();

// The `MapgenLoad` plugin loads existing map data from disk. The argument given
// to it is the directory to store map data in.
var MapgenLoad = require("./plugins/mapgen-load"),
    mapgen_load = new MapgenLoad(__dirname + "/map");
map.add_generator(mapgen_load.modify.bind(mapgen_load));

// The `MapgenSimplex` plugin generates pseudorandom terrain using an algorithm
// related to _Perlin Noise_, [Simplex Noise](http://en.wikipedia.org/wiki/Simplex_noise).
// The argument you see here is the "seed" value.
var MapgenSimplex = require("./plugins/mapgen-simplex"),
    mapgen_simplex = new MapgenSimplex(1);
map.add_generator(mapgen_simplex.modify.bind(mapgen_simplex));

// The `MapgenWater` plugin fills the bottom of the map, up to a specified `y`
// value, with water. It does this by replacing all air blocks with a `y` less
// than that specified with water.
var MapgenWater = require("./plugins/mapgen-water"),
    mapgen_water = new MapgenWater(100);
map.add_generator(mapgen_water.modify.bind(mapgen_water));

// The `MapgenGlowstone` plugin places glowstone randomly. Yay! Great for
// testing lighting, or just impressing your friends.
var MapgenGlowstone = require("./plugins/mapgen-glowstone"),
    mapgen_glowstone = new MapgenGlowstone();
map.add_generator(mapgen_glowstone.modify.bind(mapgen_glowstone));

// The `MapgenGlassGrid` plugin puts a grid of glass pillars in the world.
// Again this is mostly useful for debugging.
var MapgenGlassGrid = require("./plugins/mapgen-glass-grid"),
    mapgen_glass_grid = new MapgenGlassGrid();
map.add_generator(mapgen_glass_grid.modify.bind(mapgen_glass_grid));

// The `MapgenFloor` plugin puts a single layer of bedrock at the bottom of the
// world. This stops people digging through to nothing by accident.
var MapgenFloor = require("./plugins/mapgen-floor"),
    mapgen_floor = new MapgenFloor();
map.add_generator(mapgen_floor.modify.bind(mapgen_floor));

// This is the `Game` object. It's (probably) the core of your server. It holds
// a lot of the wiring between different components.
var Game = require("./lib/game");

var game = new Game({
  name: nconf.get("game:name"),
  mode: nconf.get("game:mode"),
  max_players: nconf.get("game:max_players"),
  difficulty: nconf.get("game:difficulty"),
  map: map,
});

// Load some plugins

// This plugin provides the server ping functionality for reporting server
// status in the "Play Multiplayer" screen of Minecraft.
var ServerPingPlugin = require("./plugins/server-ping");
game.use(ServerPingPlugin());

// This plugin gracefully stops the server on Ctrl+C (SIGINT).
var ServerStopPlugin = require('./plugins/server-stop');
game.use(ServerStopPlugin());

// This plugin handles login for players, creating a new Player object,
// attaching it to a client and finally adding it to the active Game object.
var LoginPlugin = require("./plugins/login");
game.use(LoginPlugin());

// This plugin handles chat messages between players.
var ChatPlugin = require("./plugins/chat");
game.use(ChatPlugin());

// This plugin handles... You guessed it, digging!
var DiggingPlugin = require("./plugins/digging");
game.use(DiggingPlugin());

// This plugin does all the setup of a player to get them into the world. This
// includes things like setting their initial spawn position, sending them a
// bunch of chunks to get started, telling them about other players connected,
// etc.
var InitialSpawnPlugin = require("./plugins/initial-spawn");
game.use(InitialSpawnPlugin());

// This plugin displays chat messages when players join or leave the game.
var JoinPartPlugin = require("./plugins/join-part");
game.use(JoinPartPlugin());

// This plugin handles movement of players. It keeps track of their position,
// sends the information to other players, and so on.
var MovementPlugin = require("./plugins/movement");
game.use(MovementPlugin());

// This plugin sends periodic ping messages to connected players, to make sure
// they don't time out.
var PingPlugin = require("./plugins/ping");
game.use(PingPlugin());

// This plugin provides a `/suicide` command for players to kill themselves.
// It's largely used for debugging or getting yourself out of a wall...
var RespawnPlugin = require("./plugins/respawn");
game.use(RespawnPlugin());

// This plugin despawns players when they quit the game.
var DespawnPlugin = require("./plugins/despawn");
game.use(DespawnPlugin());

// This plugin saves the map to disk every now and then, if it's changed. The
// argument given to it is the directory in which to save the map data.
var SaveMapPlugin = require("./plugins/save-map");
game.use(SaveMapPlugin(__dirname + "/map"));

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

// Generate the spawn area so the first player to join doesn't have to sit
// around like an idiot waiting while they log in.
var chunks_generated = 0;
for (var x = -7; x <= 7; ++x) {
  for (var y = -7; y <= 7; ++y) {
    game.map.get_chunk(x, y, function(err, chunk) {
      // We keep count of how many chunks have been generated here.
      chunks_generated++;

      // This is 15x15 chunks
      if (chunks_generated === 225) {
        // We've loaded all the chunks we need, so it's time to start the
        // server listening so people can connect!
        server.listen(nconf.get("server:port"), nconf.get("server:host"));
      }
    });
  }
}
