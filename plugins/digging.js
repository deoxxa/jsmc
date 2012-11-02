
module.exports = function(game) {
  game.on("player:join", function(player) {

    player.client.on("packet:0e", function(packet) {
   
    		console.log(packet);

    		if(packet.status==2 || game.mode == 1) {

	    		var chunk_x = packet.x >> 4;
	    		var chunk_z = packet.z >> 4;

	    		var block_x = packet.x & 0x0f;
	    		var block_z = packet.z & 0x0f;
	    		var block_y = packet.y;

	    		game.map.chunks[[chunk_x, chunk_z].join(":")].set_block_type(block_x, block_z, block_y, 0);

	    		console.log("Removed block " + [ block_x , block_z, block_y ].join(":"));

	    		game.clients.forEach(function(client) {
	    			client.emit("data", { pid: 0x35, x: block_x, y: block_y, z: block_z, type: 0, metadata: 0 });
	    		});

	    	}
    });
  });
};
