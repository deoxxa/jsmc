#!/usr/bin/env node

var Game = require("./lib/game"),
    Server = require("./lib/server");

var game = new Game();

var server = new Server();

server.on("client:connect", game.add_client.bind(game));

server.on("server:listening", function() {
  console.log("listening");
});

server.on("server:close", function() {
  console.log("closed");
});

server.listen(25567);
