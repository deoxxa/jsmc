module.exports = function() {
  return function(game) {
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
  };
};
