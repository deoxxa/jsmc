var Chunk = require("./chunk"),
    SimplexNoise = require("simplex-noise");

var Map = module.exports = function Map() {
  this.chunks = {};

  this.simplex = new SimplexNoise();
};

Map.prototype.get_abs_chunk = function get_abs_chunk(block_x, block_z, cb) {
  return this.get_chunk(block_x >> 4, block_z >> 4, cb);
};

Map.prototype.get_chunk = function get_chunk(chunk_x, chunk_z, cb) {
  var key = [chunk_x, chunk_z].join(":");

  if (!this.chunks[key]) {
    var chunk = this.chunks[key] = new Chunk(chunk_x, chunk_z);

    for (var x=0;x<16;++x) {
      for (var z=0;z<16;++z) {
        chunk.set_block_type(x, z, 0, 7);

        for (var y=1;y<255;++y) {
          var val = this.simplex.noise3D((chunk_x * 16 + x) / 128, y / 32, (chunk_z * 16 + z) / 128);

          if (val > (y / 150 - 0.8)) {
            chunk.set_block_type(x, z, y, 1);
          }

          if (Math.random() > 0.995 && chunk.get_block_type(x, z, y) === 0) {
            chunk.set_block_type(x, z, y, 89);
          }
        }
      }
    }

/*
    for (var x=0;x<16;++x) {
      for (var z=0;z<16;++z) {
        for (var y=0;y<256;++y) {
          chunk.set_light_block(x, z, y, 15);
          chunk.set_light_sky(x, z, y, 15);
        }
      }
    }
*/

    chunk.calculate_light();
  }

  return cb(null, this.chunks[key]);
};
