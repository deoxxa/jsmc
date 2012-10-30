#!/usr/bin/env node

var Game = require("./lib/game"),
    Server = require("./lib/server");

var game = new Game();

process.argv.slice(2).filter(function(e) { return e.match(/\.js$/); }).forEach(function(file) {
  console.log(file);
  var plugin = require(file);
  plugin(game);
});

var server = new Server();

server.on("client:connect", game.add_client.bind(game));

server.on("server:listening", function() {
  console.log("listening");
});

server.on("server:close", function() {
  console.log("closed");
});

server.listen(process.argv[2] || 25565);
