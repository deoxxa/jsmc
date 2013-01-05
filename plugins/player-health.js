module.exports = function() {
  return function(game) {
    game.on("player:join", function(player) {
      player.on("damage", on_damage.bind(player));

      // defaults
      player.damaged = 0;
    });

    game.on("tick", update_health.bind(null, game));
  };
};

var on_damage = function on_damage(damage) {
    //set the damage to the player if they aren't on creative mode, so 0 or 2
    if(this.mode != 1) {
      this.damaged += damage;
    }
  };

var update_health = function update_health(game) {
    game.players.filter(function(e) {
      return e.damaged > 0;
    }).forEach(function(player) {
      // modify the players health to match the damage done
      player.health -= player.damaged;
      // send out necessary packet to update the health
      player.health < 0 ? player.kill() : player.setHealth(player.health, player.food, player.saturation);
      // reset the damage done
      player.damaged = 0;
    });
  };
