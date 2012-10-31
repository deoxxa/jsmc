var Steez = require("steez"),
    util = require("util");

var Client = module.exports = function Client() {
  Steez.call(this);

  this.player = null;
};
util.inherits(Client, Steez);

Client.prototype.write = function(packet) {
  console.log(packet);

  this.emit("packet", packet);
  this.emit(["packet", ("00" + packet.pid.toString(16)).substr(-2, 2)].join(":"), packet);

  return !this.paused && this.writable;
};
