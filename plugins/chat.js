module.exports = function(game) {
  game.on("player:join", function(player) {
    player.client.on("packet:03", function(packet) {
      game.players.forEach(function(other) {
        other.client.emit("data", {pid: 0x03, message: "<" + player.name + " [eid " + player.eid + "]> " + packet.message});
      });
    });
  });
};
