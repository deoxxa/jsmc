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

S.prototype.mcabsint = function mcabsint(data) {
  return this.int32be(Math.round(data * 32));
};

S.prototype.mcabsbyte = function mcabsbyte(data) {
  return this.int8(Math.round(data * 32));
};

S.prototype.mcbytedegree = function mcbytedegree(data) {
  return this.uint8(Math.round(data / 360 * 255));
};

S.prototype.mcmetadata = function mcmetadata(data) {
  data.forEach(function(e) {
    var k = e[1];

    if (e[0] === "byte") {
      this.uint8(k).int8(e[2]);
    }

    if (e[0] === "short") {
      k |= 32;
      this.uint8(k).int16be(e[2]);
    }

    if (e[0] === "int") {
      k |= 64;
      this.uint8(k).int32be(e[2]);
    }

    if (e[0] === "float") {
      k |= 96;
      this.uint8(k).floatbe(e[2]);
    }

    if (e[0] === "string16") {
      k |= 128;
      this.uint8(k).mcstring16(e[2]);
    }

    if (e[0] === "slot") {
      k |= 160;
      this.uint8(k).int32be(e[2][0]).int8(e[2][1]).int32be(e[2][2]);
    }

    if (e[0] === "ints") {
      k |= 192;
      this.uint8(k).int32be(e[2][0]).int32be(e[2][1]).int32be(e[2][2]);
    }
  }.bind(this));

  return this.uint8(0x7f);
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

    case 0x03: {
      this.emit("data", S().uint8(packet.pid).mcstring16(packet.message).result());
      break;
    }

    case 0x06: {
      this.emit("data", S().uint8(packet.pid).int32be(packet.x).int32be(packet.y).int32be(packet.z).result());
      break;
    }

    case 0x0b: {
      this.emit("data", S().uint8(packet.pid).doublebe(packet.x).doublebe(packet.y).doublebe(packet.stance).doublebe(packet.z).result());
      break;
    }

    case 0x0d: {
      this.emit("data", S().uint8(packet.pid).doublebe(packet.x).doublebe(packet.stance).doublebe(packet.y).doublebe(packet.z).floatbe(packet.yaw).floatbe(packet.pitch).uint8(packet.on_ground).result());
      break;
    }

    case 0x14: {
      this.emit("data", S().uint8(packet.pid).uint32be(packet.eid).mcstring16(packet.name).mcabsint(packet.x).mcabsint(packet.y).mcabsint(packet.z).mcbytedegree(packet.yaw).mcbytedegree(packet.pitch).uint16be(packet.current_item).mcmetadata(packet.metadata).result());
      break;
    }

    case 0x21: {
      this.emit("data", S().uint8(packet.pid).uint32be(packet.eid).mcabsbyte(packet.x).mcabsbyte(packet.y).mcabsbyte(packet.z).mcbytedegree(packet.yaw).mcbytedegree(packet.pitch).result());
      break;
    }

    case 0x22: {
      this.emit("data", S().uint8(packet.pid).uint32be(packet.eid).int32be(Math.round(packet.x)).int32be(Math.round(packet.y)).int32be(Math.round(packet.z)).mcbytedegree(packet.yaw).mcbytedegree(packet.pitch).result());
      break;
    }

    case 0x33: {
      this.emit("data", S().uint8(packet.pid).int32be(packet.x).int32be(packet.z).uint8(packet.solid).int16be(packet.primary_bitmap).int16be(packet.add_bitmap).uint32be(packet.data.length).buffer(packet.data).result());
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
