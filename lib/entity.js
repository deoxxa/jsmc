var events = require("events"),
    util = require("util");

var Entity = module.exports = function Entity(game, options) {
  events.EventEmitter.call(this);

  this.game = game;
  this.eid = game.get_eid();

  this.options = (typeof options === "object" && options !== null) ? options : {};

  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.yaw = 0;
  this.pitch = 0;

  if (typeof this.options.x     === "number") { this.x     = this.options.x;     }
  if (typeof this.options.y     === "number") { this.y     = this.options.y;     }
  if (typeof this.options.z     === "number") { this.z     = this.options.z;     }
  if (typeof this.options.yaw   === "number") { this.yaw   = this.options.yaw;   }
  if (typeof this.options.pitch === "number") { this.pitch = this.options.pitch; }
};
util.inherits(Entity, events.EventEmitter);
