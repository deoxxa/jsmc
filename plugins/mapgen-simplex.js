var SimplexNoise = require("simplex-noise");

var MapgenSimplex = module.exports = function MapgenSimplex(seed) {
  this.seed = seed || Math.random();

  this.noise = new SimplexNoise(function() { return this.seed; }.bind(this));
};

MapgenSimplex.prototype.modify = function modify(chunk, cb) {
  for (var x = 0; x < 16; ++x) {
    for (var z = 0; z < 16; ++z) {
      for (var y = 0; y < 256; ++y) {
        var val = this.noise.noise3D((chunk.x * 16 + x) / 128, y / 32, (chunk.z * 16 + z) / 128);

        if (val > (y / 150 - 0.8)) {
          chunk.set_block_type(x, z, y, 1);
        }
      }
    }
  }

  return cb(null, chunk);
};
