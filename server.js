#!/usr/bin/env node

var Game = require("./lib/game"),
    Server = require("./lib/server"),
    config = require("./config.js");

var game = new Game({
  mode: 1,
});

for(var i = 0; i < config.length; i++) {
  var file = config[i];
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

server.on("client:connect", game.add_client.bind(game));

server.on("server:listening", function() {
  console.log("listening");
});

server.on("server:close", function() {
  console.log("closed");
});

server.listen(process.argv[2] || 25565);
