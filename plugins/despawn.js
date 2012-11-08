module.exports = function() {
  return function(game) {
    game.on("player:leave", function(player) {
      console.log("player " + player.name + " left, despawning");

      game.players.forEach(function(other_player) {
        if (player === other_player) { return; }

        other_player.client.emit("data", {pid: 0x1d, entities: [player.eid]});
      });
    });
  };
};
