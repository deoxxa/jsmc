var Concentrate = require("concentrate"),
    Steez = require("steez"),
    util = require("util");

function S() {
  if (!(this instanceof S)) { return new S(); }
  Concentrate.call(this);
}
util.inherits(S, Concentrate);

S.prototype.mcstring16 = function mcstring16(data) {
  var l = data.length,
      b = new Buffer(data, "ucs2");

  for (var i=0;i<l;++i) {
    var t = b[i*2+1];
    b[i*2+1] = b[i*2];
    b[i*2] = t;
  }

  return this.uint16be(l).buffer(b);
};

S.prototype.mcbuffer = function mcbuffer(data) {
  return this.uint16be(data.length).buffer(data);
};

var Serialiser = module.exports = function Serialiser() {
  Steez.call(this);
};
util.inherits(Serialiser, Steez);

Serialiser.prototype.write = function write(packet) {
  switch (packet.pid) {
    case 0x00: {
      this.emit("data", S().uint8(packet.pid).uint32be(packet.token).result());
      break;
    }

    case 0x01: {
      this.emit("data", S().uint8(packet.pid).uint32be(1).mcstring16("flat").uint8(0).uint8(0).uint8(0).uint8(0).uint8(20).result());
      break;
    }

    case 0x06: {
      this.emit("data", S().uint8(packet.pid).int32be(packet.x).int32be(packet.y).int32be(packet.z).result());
      break;
    }

    case 0x0d: {
      this.emit("data", S().uint8(packet.pid).doublebe(packet.x).doublebe(packet.stance).doublebe(packet.y).doublebe(packet.z).floatbe(packet.yaw).floatbe(packet.pitch).uint8(packet.on_ground).result());
      break;
    }

    case 0x33: {
      this.emit("data", S().uint8(packet.pid).int32be(packet.x).int32be(packet.z).uint8(packet.solid).int16be(packet.primary_bitmap).int16be(packet.add_bitmap).mcbuffer(packet.data).result());
      break;
    }

    case 0x67: {
      this.emit("data", S().uint8(packet.pid).int8(-1).int16be(-1).result());
      break;
    }

    case 0x68: {
      this.emit("data", S().uint8(packet.pid).int8(0).int16be(0).result());
      break;
    }

    case 0xfe: {
      this.emit("data", S().uint8(packet.pid).result());
      break;
    }

    case 0xff: {
      this.emit("data", S().uint8(packet.pid).mcstring16(packet.message).result());
      break;
    }
  }

  return !this.paused && this.writable;
};
