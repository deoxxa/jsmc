module.exports = function() {
  return function(game) {
    game.on("client:connect", function(client) {
      console.log("waiting for server ping packet on client");

      client.once("packet", function(packet) {
        if (packet.pid !== 0xfe) { return; }

        console.log("got server ping packet");

        client.emit("data", {
          pid: 0xff,
          message: ["§1", "51", "1.4.6", game.name, game.players.length, game.max_players].join("\x00"),
        });

        client.end();
      });
    });
  };
};
