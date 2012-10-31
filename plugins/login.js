var Player = require("../lib/player.js");

module.exports = function(game) {
  game.on("client:connect", function(client) {
    console.log("watching for login packet on client");

    client.once("packet", function(packet) {
      if (packet.pid !== 0x02) { return; }

      game.map.get_abs_chunk(0, 0, function(err, chunk) {
        var y;
        for (y = 255; y > 0 && chunk.get_block_type(0, 0, y) === 0; --y) {}
        y += 2;

        var player = new Player(client, game, packet.username, {x: 0, y: y, z: 0, stance: y + 1.62, yaw: 0, pitch: 0});

        console.log("created player " + player.name + " and spawning at " + [player.position.x, player.position.y, player.position.z].join(","));

        console.log("logging player in");

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
  });
};
