var MapgenGlowstone = module.exports = function MapgenGlowstone(seed) {
};

MapgenGlowstone.prototype.modify = function modify(chunk, cb) {
  for (var x = 0; x < 16; ++x) {
    for (var z = 0; z < 16; ++z) {
      for (var y = 0; y < 256; ++y) {
        if (Math.random() > 0.9995) {
          chunk.set_block_type(x, z, y, 89);
        }
      }
    }
  }

  return cb(null, chunk);
};
