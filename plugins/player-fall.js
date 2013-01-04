/**
  Fall plugin.
  When a user falls apply the damage to their health.
  This is by no means complete. Just having some fun playing with node and minecraft.
  Also, this doesn't yet take into consideration velocity, and falling into water.

  This might need to be loaded after player-abilities plugin.
*/
module.exports = function() {
  return function(game) {
    game.on("player:join", function(player) {
      player.client.on("packet:0a", on_fall.bind(player, game));
      player.client.on("packet:0b", on_fall.bind(player, game));
      player.client.on("packet:0c", on_fall.bind(player, game));
      player.client.on("packet:0d", on_fall.bind(player, game));
      player.on("flying", handle_falling_pos.bind(player));
    });
  };
};

var set_falling_pos = function set_falling_pos(player) {
    player.start_falling_pos = player.y;
  }

var handle_falling_pos = function handle_falling_pos(flying) {
    // if the player stops flying
    if(!flying) set_falling_pos(this);
  }

var on_fall = function on_fall(game, packet) {
    // Need the block type to determine if the player is swimming.
    // Maybe there is a better way to do this? ...swimming/flying should probably be kept track of in player.js with movement.js
    var x = packet.x || this.x,
      z = packet.z || this.z,
      y = packet.y || this.y;

    var block_x = x & 0x0f,
      block_z = z & 0x0f,
      block_y = y;

    var that = this;

    var WATER = 8;
    var STATIONARY_WATER = 9;

    game.map.get_abs_chunk(x, z, function(err, chunk) {
      var blockType = chunk.get_block_type(block_x, block_z, block_y);
      var swimming = blockType == STATIONARY_WATER || blockType == WATER;

      // try to guess if they are flying to begin with
      // if the block below them is air then they are probably flying
      // this is untested - might need to find a way to do this with the protocol
      if(typeof that.flying == "undefined") {
        that.flying = chunk.get_block_type(block_x, block_z, block_y - 1) == 0;
      }

      // don't apply fall if they are swimming
      if(!swimming) {
        // when on_ground changes from true to false start keeping track of distance
        if(that.on_ground && !packet["on_ground"]) {
          set_falling_pos(that);
        }
        // Edge case:
        // also when flying changes from true to false we need to set the height
        // - this will get handled when the "flying",false event fires

        // when it changes from false to true then calculate damage
        if(!that.on_ground && packet["on_ground"]) {
          var damage = Math.floor(that.start_falling_pos - packet.y - 3);
          //trigger a damage event on the player
          if(damage > 0) that.emit("damage", damage);

          //TODO?: emit sound 0x3e
        }
      }

    });
  };
