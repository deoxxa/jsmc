#!/usr/bin/env node

var Game = require("./lib/game"),
    Server = require("./lib/server");

var game = new Game();

game.on("player:join", function(player) {
  game.players.forEach(function(other) {
    if (other === player) { return; }
    other.client.emit("data", {pid: 0x03, message: ["*", player.name, "joined"].join(" ")});
  });
});

game.on("player:leave", function(player) {
  game.players.forEach(function(other) {
    if (other === player) { return; }
    other.client.emit("data", {pid: 0x03, message: ["*", player.name, "left"].join(" ")});
  });
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
