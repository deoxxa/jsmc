var MapgenFloor = module.exports = function MapgenFloor(seed) {
};

MapgenFloor.prototype.modify = function modify(chunk, cb) {
  for (var x = 0; x < 16; ++x) {
    for (var z = 0; z < 16; ++z) {
      chunk.set_block_type(x, z, 0, 7);
    }
  }

  return cb(null, chunk);
};
