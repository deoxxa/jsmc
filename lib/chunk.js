var events = require("events"),
    util = require("util");

var Chunk = module.exports = function Chunk(x, z) {
  events.EventEmitter.call(this);

  this.x = x;
  this.z = z;

  this.data = new Buffer(196864);
  this.data.fill(0);

  this.dirty = false;
};
util.inherits(Chunk, events.EventEmitter);

Chunk.prototype.get_block_type = function get_block_type(x, z, y) {
  return this.data[x + (z << 4) + (y << 8)];
};

Chunk.prototype.set_block_type = function set_block_type(x, z, y, type) {
  var index = x + (z << 4) + (y << 8);

  var was = this.data[index];

  this.data[index] = type;

  this.dirty = true;

  this.emit("block:type:change", x, z, y, type, was);

  return this;
};

Chunk.prototype.get_block_meta = function get_block_meta(x, z, y) {
  var index = 65536 + Math.floor((x + (z << 4) + (y << 8)) / 2);

  if (x % 2) {
    return this.data[index] >> 4;
  } else {
    return this.data[index] & 0x0f;
  }
};

Chunk.prototype.set_block_meta = function set_block_meta(x, z, y, meta) {
  var index = 65536 + Math.floor((x + (z << 4) + (y << 8)) / 2),
      was = null;

  if (x % 2) {
    was = this.data[index] >> 4;
    this.data[index] &= 0x0f;
    this.data[index] |= (meta << 4);
  } else {
    was = this.data[index] & 0x0f;
    this.data[index] &= 0xf0;
    this.data[index] |= (meta & 0x0f);
  }

  this.dirty = true;

  this.emit("block:meta:change", x, z, y, meta, was);

  return this;
};

Chunk.prototype.get_light_block = function get_light_block(x, z, y) {
  var index = 98304 + Math.floor((x + (z << 4) + (y << 8)) / 2);

  if (x % 2) {
    return this.data[index] >> 4;
  } else {
    return this.data[index] & 0x0f;
  }
};

Chunk.prototype.set_light_block = function set_light_block(x, z, y, light) {
  var index = 98304 + Math.floor((x + (z << 4) + (y << 8)) / 2),
      was = null;

  if (x % 2) {
    was = this.data[index] >> 4;
    this.data[index] &= 0x0f;
    this.data[index] |= (light << 4);
  } else {
    was = this.data[index] & 0x0f;
    this.data[index] &= 0xf0;
    this.data[index] |= (light & 0x0f);
  }

  this.dirty = true;

  this.emit("light:block:change", x, z, y, light, was);

  return this;
};

Chunk.prototype.get_light_sky = function get_light_sky(x, z, y) {
  var index = 131072 + Math.floor((x + (z << 4) + (y << 8)) / 2);

  if (x % 2) {
    return this.data[index] >> 4;
  } else {
    return this.data[index] & 0x0f;
  }
};

Chunk.prototype.set_light_sky = function set_light_sky(x, z, y, light) {
  var index = 131072 + Math.floor((x + (z << 4) + (y << 8)) / 2),
      was = null;

  if (x % 2) {
    was = this.data[index] >> 4;
    this.data[index] &= 0x0f;
    this.data[index] |= (light << 4);
  } else {
    was = this.data[index] & 0x0f;
    this.data[index] &= 0xf0;
    this.data[index] |= (light & 0x0f);
  }

  this.dirty = true;

  this.emit("light:sky:change", x, z, y, light, was);

  return this;
};

Chunk.prototype.get_additional = function get_additional(x, z, y) {
  var index = 163840 + Math.floor((x + (z << 4) + (y << 8)) / 2);

  if (x % 2) {
    return this.data[index] >> 4;
  } else {
    return this.data[index] & 0x0f;
  }
};

Chunk.prototype.set_additional = function set_additional(x, z, y, data) {
  var index = 163840 + Math.floor((x + (z << 4) + (y << 8)) / 2),
      was = null;

  if (x % 2) {
    was = this.data[index] >> 4;
    this.data[index] &= 0xf0;
    this.data[index] |= (data & 0x0f);
  } else {
    was = this.data[index] & 0x0f;
    this.data[index] &= 0x0f;
    this.data[index] |= (data << 4);
  }

  this.dirty = true;

  this.emit("block:additional:change", x, z, y, data, was);

  return this;
};

Chunk.prototype.get_biome = function get_biome(x, z, y) {
  return this.data[196608 + x + (z << 4) + (y << 8)];
};

Chunk.prototype.set_biome = function set_biome(x, z, biome) {
  var index = 196608 + x + (z << 4);

  var was = this.data[index];

  this.data[index] = biome;

  this.dirty = true;

  this.emit("biome:change", x, z, biome, was);

  return this;
};
