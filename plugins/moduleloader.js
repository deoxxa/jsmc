module.exports = function(game) {
  game.on("player:join", function(player) {

    player.client.on("packet:03", function(packet) {

    	var tmp = packet.message.split(" ");

    	if(tmp[0]=="/loadplugin") {
    		if(tmp.length>2) {
    		  player.client.emit("data", {pid: 0x03, message: "/loadplugin <filename>" });
            } else {
              try {
                  var plugin = require('./' + tmp[1]);
                  plugin(game);
                  // User needs to reconnect before module will take effect
                  player.client.emit("data", {pid: 0xff, message: "Please rejoin to activate " + tmp[1] });
              } catch(error) {
                  player.client.emit("data", {pid: 0x03, message: error.toString() });
              }
            }
    	}

        if(tmp[0]=="/listplugins") {
            require('fs').readdir('./plugins', function(err, files) {
                player.client.emit("data", {pid: 0x03, message: "Available plugins:" });
                for(var i = 0; i < files.length; i++) {
                    player.client.emit("data", {pid: 0x03, message: " - " + files[i] });
                }
            });
        }

    });

  });
};
