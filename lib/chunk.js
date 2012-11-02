var light_block_emit = new Buffer(256),
    light_block_stop = new Buffer(256);

light_block_emit.fill(0);
light_block_stop.fill(15);

light_block_emit[0x0A] = 15;
light_block_emit[0x0B] = 15;
light_block_emit[0x27] = 1;
light_block_emit[0x32] = 14;
light_block_emit[0x33] = 15;
light_block_emit[0x3E] = 14;
light_block_emit[0x4A] = 9;
light_block_emit[0x4C] = 7;
light_block_emit[0x59] = 15;
light_block_emit[0x5A] = 11;
light_block_emit[0x5B] = 15;

light_block_stop[0x00] = 0;
light_block_stop[0x06] = 0;
light_block_stop[0x08] = 2;
light_block_stop[0x09] = 2;
light_block_stop[0x12] = 2;
light_block_stop[0x14] = 0;
light_block_stop[0x25] = 0;
light_block_stop[0x26] = 0;
light_block_stop[0x27] = 0;
light_block_stop[0x28] = 0;
light_block_stop[0x32] = 0;
light_block_stop[0x33] = 0;
light_block_stop[0x34] = 0;
light_block_stop[0x35] = 0;
light_block_stop[0x37] = 0;
light_block_stop[0x40] = 0;
light_block_stop[0x41] = 0;
light_block_stop[0x42] = 0;
light_block_stop[0x43] = 0;
light_block_stop[0x47] = 0;
light_block_stop[0x4b] = 0;
light_block_stop[0x4C] = 0;
light_block_stop[0x4e] = 0;
light_block_stop[0x4f] = 2;
light_block_stop[0x55] = 0;
light_block_stop[0x5A] = 0;
light_block_stop[0x5B] = 0;

var Chunk = module.exports = function Chunk(x, z) {
  this.x = x;
  this.z = z;

  this.data = new Buffer(196864);
  this.data.fill(0);
};

Chunk.prototype.calculate_light = function calculate_light() {
  this.data.fill(0, 98304, 163840);

  var spread_sky = this.initial_light_sky();
  while (spread_sky.length) {
    var job = spread_sky.shift();
    this.spread_light_sky(job[0], job[1], job[2], spread_sky);
  }

  var spread_block = this.initial_light_block();
  while (spread_block.length) {
    var job = spread_block.shift();
    this.spread_light_block(job[0], job[1], job[2], spread_block);
  }
};

Chunk.prototype.initial_light_sky = function initial_light_sky() {
  var jobs = [];

  for (var x = 0; x < 16; ++x) {
    for (var z = 0; z < 16; ++z) {
      for (var y = 255; y >= 0 && this.get_block_type(x, z, y) === 0; --y) {
        this.set_light_sky(x, z, y, 15);
      }
      jobs.push([x, z, y + 1]);
    }
  }

  return jobs;
};

Chunk.prototype.spread_light_sky = function spread_light_sky(x, z, y, jobs) {
  var s = this.get_light_sky(x, z, y);

  if (x >   0) { this.spread_light_sky_apply(x - 1, z,     y,     s, jobs); }
  if (x <  15) { this.spread_light_sky_apply(x + 1, z,     y,     s, jobs); }
  if (z >   0) { this.spread_light_sky_apply(x,     z - 1, y,     s, jobs); }
  if (z <  15) { this.spread_light_sky_apply(x,     z + 1, y,     s, jobs); }
  if (y >   0) { this.spread_light_sky_apply(x,     z,     y - 1, s, jobs); }
  if (y < 255) { this.spread_light_sky_apply(x,     z,     y + 1, s, jobs); }
};

Chunk.prototype.spread_light_sky_apply = function spread_light_sky_apply(x, z, y, s, jobs) {
  var reduction = light_block_stop[this.get_block_type(x, z, y)],
      result = s - reduction;

  if (this.get_light_sky(x, z, y) < result) {
    this.set_light_sky(x, z, y, result);
    jobs.push([x, z, y]);
  }
};

Chunk.prototype.initial_light_block = function initial_light_block() {
  var jobs = [];

  for (var x = 0; x < 16; ++x) {
    for (var z = 0; z < 16; ++z) {
      for (var y = 0; y < 256; ++y) {
        var light = light_block_emit[this.get_block_type(x, z, y)];
        if (!light) { continue; }
        this.set_light_block(x, z, y, light);
        jobs.push([x, z, y]);
      }
    }
  }

  return jobs;
};

Chunk.prototype.spread_light_block = function spread_light_block(x, z, y, jobs) {
  var s = this.get_light_block(x, z, y) - 1;

  if (x >   0) { this.spread_light_block_apply(x - 1, z,     y,     s, jobs); }
  if (x <  15) { this.spread_light_block_apply(x + 1, z,     y,     s, jobs); }
  if (z >   0) { this.spread_light_block_apply(x,     z - 1, y,     s, jobs); }
  if (z <  15) { this.spread_light_block_apply(x,     z + 1, y,     s, jobs); }
  if (y >   0) { this.spread_light_block_apply(x,     z,     y - 1, s, jobs); }
  if (y < 255) { this.spread_light_block_apply(x,     z,     y + 1, s, jobs); }
};

Chunk.prototype.spread_light_block_apply = function spread_light_block_apply(x, z, y, s, jobs) {
  var reduction = light_block_stop[this.get_block_type(x, z, y)],
      result = s - reduction;

  if (this.get_light_block(x, z, y) < result) {
    this.set_light_block(x, z, y, result);
    jobs.push([x, z, y]);
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
