module.exports = function(game) {
  game.on("client:connect", function(client) {
    client.once("packet", function(packet) {
      if (packet.id !== 0xfe) { return; }

      client.emit("data", {
        pid: 0xff,
        message: ["§1", "47", "1.4.2", game.name, game.players.length, game.max_players].join("\x00"),
      });

      client.end();
    });
  });
};
