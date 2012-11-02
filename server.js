#!/usr/bin/env node

var nconf = require('nconf');

nconf.file({ file: "./config.json" });

var Game = require("./lib/game"),
    Server = require("./lib/server");

var game = new Game({
  mode: nconf.get("gamemode"),
});

var plugins = nconf.get("plugins");

for(var i = 0; i < plugins.length; i++) {
  var file = plugins[i];
  console.log("Loading " + file);
  var plugin = require("./plugins/" + file);
  plugin(game);
}

for (var x = -7; x <= 7; ++x) {
  for (var y = -7; y <= 7; ++y) {
    (function(x, y) {
      game.map.get_chunk(x, y, function(err, chunk) {
        console.log("chunk " + [x, y].join(",") + " is done");
      });
    }(x, y));
  }
}

var server = new Server();
var port = nconf.get("port") || 25565;

server.on("client:connect", game.add_client.bind(game));

server.on("server:listening", function() {
  console.log("listening");
});

server.on("server:close", function() {
  console.log("closed");
});

server.listen(process.argv[2] || 25565);
