var MapgenWater = module.exports = function MapgenWater(depth) {
  this.depth = depth || 100;
};

MapgenWater.prototype.modify = function modify(chunk, cb) {
  for (var x = 0; x < 16; ++x) {
    for (var z = 0; z < 16; ++z) {
      for (var y = 0; y < this.depth; ++y) {
        if (chunk.get_block_type(x, z, y) === 0) {
          chunk.set_block_type(x, z, y, 9);
        }
      }
    }
  }

  return cb(null, chunk);
};
