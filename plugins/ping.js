module.exports = function() {
  return function(game) {
    game.on("player:join", function(player) {
      var ping_interval = setInterval(function() {
        player.client.emit("data", {pid: 0x00, token: 0});
      }, 1000);

      player.on("game:leave", function() { clearInterval(ping_interval); });
    });
  };
};
