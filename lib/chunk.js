var Chunk = module.exports = function Chunk() {
  this.data = new Buffer(196864);
  this.data.fill(0);
};

Chunk.prototype.data_for_network = function data_for_network() {
  var data = new Buffer(196864);

  data.fill(0);

  for (var i=0;i<16;++i) {
    this.data.copy(data, (i * 12288),                  (i * 4096),          (i * 4096 + 4096));
    this.data.copy(data, (i * 12288 + 4096),  (65536  + i * 2048),  (65536 + i * 2048 + 2048));
    this.data.copy(data, (i * 12288 + 6144),  (98304  + i * 2048),  (98304 + i * 2048 + 2048));
    this.data.copy(data, (i * 12288 + 8192),  (131072 + i * 2048), (131072 + i * 2048 + 2048));
    this.data.copy(data, (i * 12288 + 10240), (163840 + i * 2048), (163840 + i * 2048 + 2048));
  }
  this.data.copy(data, 196608, 196608, 196864);

  return data;
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
    this.data[index] &= 0xf0;
    this.data[index] |= (meta & 0x0f);
  } else {
    this.data[index] &= 0x0f;
    this.data[index] |= (meta << 4) & 0xf0;
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
    this.data[index] &= 0xf0;
    this.data[index] |= (light & 0x0f);
  } else {
    this.data[index] &= 0x0f;
    this.data[index] |= (light << 4) & 0xf0;
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
    this.data[index] &= 0xf0;
    this.data[index] |= (light & 0x0f);
  } else {
    this.data[index] &= 0x0f;
    this.data[index] |= (light << 4) & 0xf0;
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
    this.data[index] |= (data << 4) & 0xf0;
  }

  return this;
};

Chunk.prototype.get_biome = function get_biome(x, z, y) {
  return this.data[163840 + x + (z << 4) + (y << 8)];
};

Chunk.prototype.set_biome = function set_biome(x, z, y, biome) {
  this.data[196608 + x + (z << 4) + (y << 8)] = biome;

  return this;
};
