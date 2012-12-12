var zlib = require("zlib");

module.exports = function() {
  return function(game) {
    game.on("player:join", function(player) {
      console.log("doing initial spawn stuff with player " + player.name);

      var sent_chunks = 0;
      for (var x = -7; x <= 7; ++x) {
        for (var z = -7; z <= 7; ++z) {
          (function(x, z) {
            game.map.get_chunk(x, z, function(err, chunk) {
              zlib.deflate(chunk.data, function(err, data) {
                player.client.emit("data", {pid: 0x33, x: x, z: z, solid: 1, primary_bitmap: 65535, add_bitmap: 65535, data: data});

                sent_chunks++;

                if (sent_chunks === 225) {
                  game.players.forEach(function(other_player) {
                    if (player === other_player) { return; }

                    player.client.emit("data", {
                      pid: 0x14,
                      eid: other_player.eid,
                      name: other_player.name.substr(0, 14),
                      x: other_player.x,
                      y: other_player.y,
                      z: other_player.z,
                      yaw: other_player.yaw,
                      pitch: other_player.pitch,
                      current_item: 0,
                      metadata: [["int", 8, 0]],
                    });

                    other_player.client.emit("data", {
                      pid: 0x14,
                      eid: player.eid,
                      name: player.name.substr(0, 14),
                      x: player.x,
                      y: player.y,
                      z: player.z,
                      yaw: player.yaw,
                      pitch: player.pitch,
                      current_item: 0,
                      metadata: [["int", 8, 0]],
                    });
                  });

                  player.client.emit("data", {pid: 0x06, x: 0, y: 30, z: 0});
                  player.client.emit("data", {
                    pid: 0x0d,
                    x: player.x,
                    y: player.y,
                    z: player.z,
                    stance: player.stance,
                    yaw: player.yaw,
                    pitch: player.pitch,
                    on_ground: player.on_ground,
                  });
                }
              });
            });
         })(x, z);
        }
      }
    });
  };
};
