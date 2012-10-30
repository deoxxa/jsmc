var Player = require("../lib/player.js");

module.exports = function(game) {
  game.on("client:connect", function(client) {
    console.log("watching for login packet on client");

    client.once("packet", function(packet) {
      if (packet.pid !== 0x02) { return; }

      console.log("logging in client");

      var player = new Player(client, game.get_eid(), packet.username, {x: Math.random() * 10, y: 10, z: Math.random() * 10, stance: 11.62, yaw: 0, pitch: 0});

      client.emit("data", {
        pid: 0x01,
        eid: player.eid,
        level_type: game.world.type,
        game_mode: game.mode,
        dimension: game.world.dimension,
        difficulty: game.difficulty,
        max_players: game.max_players,
      });

      game.add_player(player);

      client.on("game:disconnect", function() {
        game.remove_player(player);
      });
    });
  });
};
