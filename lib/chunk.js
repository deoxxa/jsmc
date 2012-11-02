var Chunk = module.exports = function Chunk() {
  this.data = new Buffer(196864);
  this.data.fill(0);
};

Chunk.prototype.calculate_light = function calculate_light() {
  this.data.fill(0, 98304, 163840);

  var tops = this.initial_light_sky();

  tops.forEach(this.spread_light_sky.apply.bind(this.spread_light_sky, this));
};

Chunk.prototype.initial_light_sky = function initial_light_sky() {
  var tops = [];

  for (var x = 0; x < 16; ++x) {
    for (var z = 0; z < 16; ++z) {
      for (var y = 255; y >= 0 && this.get_block_type(x, z, y) === 0; --y) {
        this.set_light_sky(x, z, y, 15);
      }
      tops.push([x, z, y + 1]);
    }
  }

  return tops;
};

Chunk.prototype.spread_light_sky = function spread_light_sky(x, z, y) {
  var s = this.get_light_sky(x, z, y) - 1;

  if (x >   0) { this.spread_light_sky_apply(x - 1, z,     y,     s); }
  if (x <  15) { this.spread_light_sky_apply(x + 1, z,     y,     s); }
  if (z >   0) { this.spread_light_sky_apply(x,     z - 1, y,     s); }
  if (z <  15) { this.spread_light_sky_apply(x,     z + 1, y,     s); }
  if (y >   0) { this.spread_light_sky_apply(x,     z,     y - 1, s); }
  if (y < 255) { this.spread_light_sky_apply(x,     z,     y + 1, s); }
};

Chunk.prototype.spread_light_sky_apply = function spread_light_sky_apply(x, z, y, s) {
  if (this.get_light_sky(x, z, y) < s) {
    this.set_light_sky(x, z, y, s);
    this.spread_light_sky(x, z, y);
  }
};

Chunk.prototype.get_block_type = function get_block_type(x, z, y) {
  return this.data[x + (z << 4) + (y << 8)];
};

Chunk.prototype.set_block_type = function set_block_type(x, z, y, type) {
  this.data[x + (z << 4) + (y << 8)] = type;

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
  var index = 65536 + Math.floor((x + (z << 4) + (y << 8)) / 2);

  if (x % 2) {
    this.data[index] &= 0x0f;
    this.data[index] |= (meta << 4);
  } else {
    this.data[index] &= 0xf0;
    this.data[index] |= (meta & 0x0f);
  }

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
  var index = 98304 + Math.floor((x + (z << 4) + (y << 8)) / 2);

  if (x % 2) {
    this.data[index] &= 0x0f;
    this.data[index] |= (light << 4);
  } else {
    this.data[index] &= 0xf0;
    this.data[index] |= (light & 0x0f);
  }

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
  var index = 131072 + Math.floor((x + (z << 4) + (y << 8)) / 2);

  if (x % 2) {
    this.data[index] &= 0x0f;
    this.data[index] |= (light << 4);
  } else {
    this.data[index] &= 0xf0;
    this.data[index] |= (light & 0x0f);
  }

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
  var index = 163840 + Math.floor((x + (z << 4) + (y << 8)) / 2);

  if (x % 2) {
    this.data[index] &= 0xf0;
    this.data[index] |= (data & 0x0f);
  } else {
    this.data[index] &= 0x0f;
    this.data[index] |= (data << 4);
  }

  return this;
};

Chunk.prototype.get_biome = function get_biome(x, z, y) {
  return this.data[196608 + x + (z << 4) + (y << 8)];
};

Chunk.prototype.set_biome = function set_biome(x, z, y, biome) {
  this.data[196608 + x + (z << 4) + (y << 8)] = biome;

  return this;
};
