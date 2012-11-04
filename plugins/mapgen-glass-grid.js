var MapgenGlassGrid = module.exports = function MapgenGlassGrid(seed) {
};

MapgenGlassGrid.prototype.modify = function modify(chunk, cb) {
  for (var x = 0; x < 16; ++x) {
    for (var z = 0; z < 16; ++z) {
      for (var y = 0; y < 256; ++y) {
        if ((x % 16 === 0 ? 1 : 0) + (z % 16 === 0 ? 1 : 0) + (y % 16 === 0 ? 1 : 0) >= 2) {
          chunk.set_block_type(x, z, y, 20);
        }
      }
    }
  }

  return cb(null, chunk);
};
