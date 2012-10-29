var Chunk = require("./chunk");

var Map = module.exports = function Map() {
  this.chunks = {};
};

Map.prototype.get_chunk = function get_chunk(x, z, cb) {
  var key = [x, z].join(":");

  if (!this.chunks[key]) {
    var chunk = this.chunks[key] = new Chunk();

    for (var x=0;x<16;++x) {
      for (var z=0;z<16;++z) {
        chunk.set_block_type(x, z, 0, 0x02);
      }
    }
  }

  return cb(null, this.chunks[key]);
};
