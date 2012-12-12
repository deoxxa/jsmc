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

            case "/gamemode": {
              m.shift();
              var mode = m[m.length-1];
              if(mode > 1 || mode < 0) {
                player.message("Invalid game mode.");
                return;
              }
              if(m.length>1) {
                player.message("Setting gamemode for " + m[0] + " to: " + mode);
                game.players.forEach(function(player) {
                  if(player.name == m[0]) {
                    player.setGamemode(parseInt(mode));
                  }
                });
              } else {
                player.message("Setting gamemode to: " + mode);
                game.setGamemode(parseInt(mode));
              }
              break;
            }

          }
        }
      });
    });
  };
};
