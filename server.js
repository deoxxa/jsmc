#!/usr/bin/env node

var Game = require("./lib/game"),
    Server = require("./lib/server"),
    Config = require('./config.js');

var game = new Game();

process.argv.slice(2).filter(function(e) { return e.match(/\.js$/); }).forEach(function(file) {
  console.log(file);
  var plugin = require(file);
  plugin(game);
});

for(var a in Config) {
	if(Config[a].enabled) {
		console.log("Loading " + a);
		var plugin = require('./plugins/' + Config[a].file);
		plugin(game);
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
