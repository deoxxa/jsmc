var Section = require("./section");

var Chunk = module.exports = function Chunk() {
  this.data = new Buffer(196864);
  this.data.fill(0);

  this.sections = [];
  for (var i=0;i<16;++i) {
    console.log("section " + i + " (" + (12288 * i) + ")");
    this.sections.push(new Section(this.data.slice(12288 * i, 12288 * (i+1))));
  }
};

["get_block_type", "set_block_type", "get_block_meta", "set_block_meta", "get_light_block", "set_light_block", "get_light_sky", "set_light_sky", "get_additional", "set_additional"].forEach(function(e) {
  Chunk.prototype[e] = function(x, z, y) {
    return this.sections[y >> 4][e].apply(this.sections[y >> 4], arguments);
  };
});

Chunk.prototype.get_biome = function get_biome(x, z, y) {
  return this.data[196608 + x + (z << 4) + (y << 8)];
};

Chunk.prototype.set_biome = function set_biome(x, z, y, biome) {
  this.data[196608 + x + (z << 4) + (y << 8)] = biome;

  return this;
};
