var zlib = require("zlib");

module.exports = function(game) {
  game.on("player:join", function(player) {
    console.log("doing initial spawn stuff with player " + player.name);

    var sent_chunks = 0;
    for (var x=-7;x<=7;++x) {
      for (var z=-7;z<=7;++z) {
        (function(x, z) {
          game.map.get_chunk(x, z, function(err, chunk) {
            zlib.deflate(chunk.data_for_network(), function(err, data) {
              player.client.emit("data", {pid: 0x33, x: x, z: z, solid: 1, primary_bitmap: 15, add_bitmap: 15, data: data});

              sent_chunks++;

              if (sent_chunks === 49) {
                game.players.forEach(function(other_player) {
                  if (player === other_player) { return; }

                  player.client.emit("data", {
                    pid: 0x14,
                    eid: other_player.eid,
                    name: other_player.name.substr(0, 14),
                    x: other_player.position.x,
                    y: other_player.position.y,
                    z: other_player.position.z,
                    yaw: other_player.position.yaw,
                    pitch: other_player.position.pitch,
                    current_item: 0,
                    metadata: [["int", 8, 0]],
                  });

                  other_player.client.emit("data", {
                    pid: 0x14,
                    eid: player.eid,
                    name: player.name.substr(0, 14),
                    x: player.position.x,
                    y: player.position.y,
                    z: player.position.z,
                    yaw: player.position.yaw,
                    pitch: player.position.pitch,
                    current_item: 0,
                    metadata: [["int", 8, 0]],
                  });
                });

                player.client.emit("data", {pid: 0x06, x: 0, y: 10, z: 0});
                player.client.emit("data", {
                  pid: 0x0d,
                  x: player.position.x,
                  y: player.position.y,
                  z: player.position.z,
                  stance: player.position.stance,
                  yaw: player.position.yaw,
                  pitch: player.position.pitch,
                  on_ground: player.position.on_ground,
                });
              }
            });
          });
       })(x, z);
      }
    }
  });
};
