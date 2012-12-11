module.exports = function() {
  return function(game) {
    game.on("player:join", function(player) {
      player.client.on("packet:03", function(packet) {

        if(player.isAdmin()) {

          var m = packet.message.split(' ');

          switch(m[0]) {

            case "/kick": {
              game.players.forEach(function(player) {
                if(player.name==m[1]) {
                  player.kick(m[2]);
                }
              });
              break;
            };

            case "/ban": {
              game.players.forEach(function(player) {
                if(player.name==m[1]) {
                  player.kick(m[2]);
                }
              });
              game.banned.push(m[1]);
              break;
            };

            case "/op": {
              game.players.forEach(function(player) {
                if(player.name==m[1]) {
                  player.admin = true;
                  player.message("You are now op!");
                }
              });
              break;
            }

            case "/deop": {
              game.players.forEach(function(player) {
                if(player.name==m[1]) {
                  player.admin = false;
                  player.message("You are no longer op!");
                }
              });
              break;
            }

          }
        }
      });
    });
  };
};
