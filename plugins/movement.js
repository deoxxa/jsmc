module.exports = function() {
  return function(game) {
    game.on("player:join", function(player) {
      player.client.on("packet:0a", on_move.bind(player));
      player.client.on("packet:0b", on_move.bind(player));
      player.client.on("packet:0c", on_move.bind(player));
      player.client.on("packet:0d", on_move.bind(player));

      player.new_position = {};
    });

    game.on("tick", update_positions.bind(null, game));
  };
};

var on_move = function on_move(packet) {
  ["yaw", "pitch"].forEach(function(e) {
    if (typeof packet[e] !== "undefined") {
      packet[e] = packet[e] % 360;

      while (packet[e] < 0) {
        packet[e] += 360;
      }
    }
  });

  ["x", "y", "z", "stance", "on_ground", "yaw", "pitch"].forEach(function(k) {
    if (typeof packet[k] !== "undefined" && packet[k] !== this[k]) {
      this.new_position[k] = packet[k];
    }
  }.bind(this));

  if (this.new_position.y < -32) {
    this.new_position.y = 10;
    this.new_position.stance = 11.62;
  }
};

var update_positions = function update_positions(game) {
  game.players.filter(function(e) { return Object.keys(e.new_position).length > 0; }).forEach(function(player) {
    var x_delta = typeof player.new_position.x === "number" ? player.new_position.x - player.x : 0,
        y_delta = typeof player.new_position.y === "number" ? player.new_position.y - player.y : 0,
        z_delta = typeof player.new_position.z === "number" ? player.new_position.z - player.z : 0;

    var packet;

    if (x_delta > -3 && x_delta < 3 && y_delta > -3 && y_delta < 3 && z_delta > -3 && z_delta < 3) {
      packet = {
        pid:   0x21,
        eid:   player.eid,
        x:     x_delta,
        y:     y_delta,
        z:     z_delta,
        yaw:   player.new_position.yaw || player.yaw,
        pitch: player.new_position.pitch || player.pitch,
      };
    } else {
      packet = {
        pid:   0x22,
        eid:   player.eid,
        x:     player.new_position.x || player.x,
        y:     player.new_position.y || player.y,
        z:     player.new_position.z || player.z,
        yaw:   player.new_position.yaw || player.yaw,
        pitch: player.new_position.pitch || player.pitch,
      };
    }

    game.players.forEach(function(other) {
      if (other === player) { return; }
      other.client.emit("data", packet);
    });

    Object.keys(player.new_position).forEach(function(k) {
      player[k] = player.new_position[k];
      delete player.new_position[k];
    });
  });
};
