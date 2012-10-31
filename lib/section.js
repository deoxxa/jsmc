var Section = module.exports = function Section(data) {
  this.data = data;
};

Section.prototype.get_block_type = function get_block_type(x, z, y) {
  return this.data[x + (z << 4) + ((y & 0x0f) << 8)];
};

Section.prototype.set_block_type = function set_block_type(x, z, y, type) {
  this.data[x + (z << 4) + ((y & 0x0f) << 8)] = type;

  return this;
};

Section.prototype.get_block_meta = function get_block_meta(x, z, y) {
  var index = 4096 + Math.floor((x + (z << 4) + ((y & 0x0f) << 8)) / 2);

  if (x % 2) {
    return this.data[index] >> 4;
  } else {
    return this.data[index] & 0x0f;
  }
};

Section.prototype.set_block_meta = function set_block_meta(x, z, y, meta) {
  var index = 4096 + Math.floor((x + (z << 4) + ((y & 0x0f) << 8)) / 2);

  if (x % 2) {
    this.data[index] &= 0xf0;
    this.data[index] |= (meta & 0x0f);
  } else {
    this.data[index] &= 0x0f;
    this.data[index] |= (meta << 4) & 0xf0;
  }

  return this;
};

Section.prototype.get_light_block = function get_light_block(x, z, y) {
  var index = 6144 + Math.floor((x + (z << 4) + ((y & 0x0f) << 8)) / 2);

  if (x % 2) {
    return this.data[index] >> 4;
  } else {
    return this.data[index] & 0x0f;
  }
};

Section.prototype.set_light_block = function set_light_block(x, z, y, light) {
  var index = 6144 + Math.floor((x + (z << 4) + ((y & 0x0f) << 8)) / 2);

  if (x % 2) {
    this.data[index] &= 0xf0;
    this.data[index] |= (light & 0x0f);
  } else {
    this.data[index] &= 0x0f;
    this.data[index] |= (light << 4) & 0xf0;
  }

  return this;
};

Section.prototype.get_light_sky = function get_light_sky(x, z, y) {
  var index = 8192 + Math.floor((x + (z << 4) + ((y & 0x0f) << 8)) / 2);

  if (x % 2) {
    return this.data[index] >> 4;
  } else {
    return this.data[index] & 0x0f;
  }
};

Section.prototype.set_light_sky = function set_light_sky(x, z, y, light) {
  var index = 8192 + Math.floor((x + (z << 4) + ((y & 0x0f) << 8)) / 2);

  if (x % 2) {
    this.data[index] &= 0xf0;
    this.data[index] |= (light & 0x0f);
  } else {
    this.data[index] &= 0x0f;
    this.data[index] |= (light << 4) & 0xf0;
  }

  return this;
};

Section.prototype.get_additional = function get_additional(x, z, y) {
  var index = 10240 + Math.floor((x + (z << 4) + ((y & 0x0f) << 8)) / 2);

  if (x % 2) {
    return this.data[index] >> 4;
  } else {
    return this.data[index] & 0x0f;
  }
};

Section.prototype.set_additional = function set_additional(x, z, y, data) {
  var index = 10240 + Math.floor((x + (z << 4) + ((y & 0x0f) << 8)) / 2);

  if (x % 2) {
    this.data[index] &= 0xf0;
    this.data[index] |= (data & 0x0f);
  } else {
    this.data[index] &= 0x0f;
    this.data[index] |= (data << 4) & 0xf0;
  }

  return this;
};
