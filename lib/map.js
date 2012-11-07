var light_block_emit = new Buffer(256),
    light_block_stop = new Buffer(256);

light_block_emit.fill(0);
light_block_stop.fill(15);

light_block_emit[0x0a] = 15;
light_block_emit[0x0b] = 15;
light_block_emit[0x27] = 1;
light_block_emit[0x32] = 14;
light_block_emit[0x33] = 15;
light_block_emit[0x3e] = 14;
light_block_emit[0x4a] = 9;
light_block_emit[0x4c] = 7;
light_block_emit[0x59] = 15;
light_block_emit[0x5a] = 11;
light_block_emit[0x5b] = 15;

light_block_stop[0x00] = 0;
light_block_stop[0x06] = 0;
light_block_stop[0x08] = 2;
light_block_stop[0x09] = 2;
light_block_stop[0x12] = 2;
light_block_stop[0x14] = 0;
light_block_stop[0x25] = 0;
light_block_stop[0x26] = 0;
light_block_stop[0x27] = 0;
light_block_stop[0x28] = 0;
light_block_stop[0x32] = 0;
light_block_stop[0x33] = 0;
light_block_stop[0x34] = 0;
light_block_stop[0x35] = 0;
light_block_stop[0x37] = 0;
light_block_stop[0x40] = 0;
light_block_stop[0x41] = 0;
light_block_stop[0x42] = 0;
light_block_stop[0x43] = 0;
light_block_stop[0x47] = 0;
light_block_stop[0x4b] = 0;
light_block_stop[0x4c] = 0;
light_block_stop[0x4e] = 0;
light_block_stop[0x4f] = 2;
light_block_stop[0x55] = 0;
light_block_stop[0x5a] = 0;
light_block_stop[0x5b] = 0;

var async = require("async");

var Chunk = require("./chunk");

var Map = module.exports = function Map(generators) {
  this.chunks = {};

  this.generators = generators || [];
};

Map.prototype.add_generator = function add_generator(fn) {
  this.generators.push(fn);
};

Map.prototype.make_key = function make_key(x, z) {
  return x.toString(36) + ":" + z.toString(36);
};

Map.prototype.get_abs_chunk = function get_abs_chunk(block_x, block_z, cb) {
  return this.get_chunk(block_x >> 4, block_z >> 4, cb);
};

Map.prototype.get_chunk = function get_chunk(chunk_x, chunk_z, cb) {
  var key = this.make_key(chunk_x, chunk_z);

  if (this.chunks[key]) {
    cb(null, this.chunks[key]);
  } else {
    var chunk = this.chunks[key] = new Chunk(chunk_x, chunk_z);

    async.waterfall([function initial(cb) { cb(null, chunk); }].concat(this.generators), function(err, chunk) {
      this.initial_light(chunk, function(err, chunk) {
        return cb(err, chunk);
      });
    }.bind(this));
  }

  return;
};

Map.prototype.initial_light = function initial_light(chunk, cb) {
  chunk.data.fill(0, 98304, 163840);

  var spread_sky = this.initial_light_sky(chunk),
      spread_block = this.initial_light_block(chunk);

  // spread light from other chunk edges
  for (var y = 0; y < 256; ++y) {
    for (var i = 0; i < 16; ++i) {
      spread_sky.push(  [((chunk.x << 4) + i),      ((chunk.z + 1) << 4),      y]);
      spread_sky.push(  [((chunk.x << 4) + i),      ((chunk.z - 1) << 4) + 15, y]);
      spread_sky.push(  [((chunk.x + 1) << 4),      ((chunk.z << 4) + i),      y]);
      spread_sky.push(  [((chunk.x - 1) << 4) + 15, ((chunk.z << 4) + i),      y]);
      spread_block.push([((chunk.x << 4) + i),      ((chunk.z + 1) << 4),      y]);
      spread_block.push([((chunk.x << 4) + i),      ((chunk.z - 1) << 4) + 15, y]);
      spread_block.push([((chunk.x + 1) << 4),      ((chunk.z << 4) + i),      y]);
      spread_block.push([((chunk.x - 1) << 4) + 15, ((chunk.z << 4) + i),      y]);
    }
  }

  while (spread_sky.length) {
    var job = spread_sky.shift();
    this.spread_light_sky(job[0], job[1], job[2], spread_sky, chunk);
  }

  while (spread_block.length) {
    var job = spread_block.shift();
    this.spread_light_block(job[0], job[1], job[2], spread_block, chunk);
  }

  return cb(null, chunk);
};

Map.prototype.initial_light_sky = function initial_light_sky(chunk) {
  var jobs = [];

  var light;

  for (var x = 0; x < 16; ++x) {
    for (var z = 0; z < 16; ++z) {
      light = 15;

      for (var y = 255; y >= 0; --y) {
        light -= light_block_stop[chunk.get_block_type(x, z, y)];

        if (light <= 0) {
          break;
        }

        chunk.set_light_sky(x, z, y, light);
        jobs.push([(chunk.x << 4) + x, (chunk.z << 4) + z, y]);
      }
    }
  }

  return jobs;
};

Map.prototype.spread_light_sky = function spread_light_sky(abs_x, abs_z, y, jobs, chunk) {
  if ((abs_x >> 4) !== chunk.x || (abs_z >> 4) !== chunk.z) {
    chunk = this.chunks[this.make_key(abs_x >> 4, abs_z >> 4)];
  }
  if (!chunk) {
    return;
  }

  var x = abs_x & 0x0f,
      z = abs_z & 0x0f;

  var s = chunk.get_light_sky(x, z, y);

  this.spread_light_sky_apply(abs_x - 1, abs_z,     y,     s, jobs, chunk);
  this.spread_light_sky_apply(abs_x + 1, abs_z,     y,     s, jobs, chunk);
  this.spread_light_sky_apply(abs_x,     abs_z - 1, y,     s, jobs, chunk);
  this.spread_light_sky_apply(abs_x,     abs_z + 1, y,     s, jobs, chunk);

  if (y >   0) { this.spread_light_sky_apply(abs_x, abs_z, y - 1, s, jobs, chunk); }
  if (y < 255) { this.spread_light_sky_apply(abs_x, abs_z, y + 1, s, jobs, chunk); }
};

Map.prototype.spread_light_sky_apply = function spread_light_sky_apply(abs_x, abs_z, y, s, jobs, chunk) {
  if ((abs_x >> 4) !== chunk.x || (abs_z >> 4) !== chunk.z) {
    chunk = this.chunks[this.make_key(abs_x >> 4, abs_z >> 4)];
  }
  if (!chunk) {
    return;
  }

  var x = abs_x & 0x0f,
      z = abs_z & 0x0f;

  var reduction = light_block_stop[chunk.get_block_type(x, z, y)] + 1,
      result = Math.max(s - reduction, 0);

  var t = chunk.get_light_sky(x, z, y);

  if (t < result) {
    chunk.set_light_sky(x, z, y, result);
    jobs.push([abs_x, abs_z, y]);
  }
};

Map.prototype.initial_light_block = function initial_light_block(chunk) {
  var jobs = [];

  for (var x = 0; x < 16; ++x) {
    for (var z = 0; z < 16; ++z) {
      for (var y = 0; y < 256; ++y) {
        var light = light_block_emit[chunk.get_block_type(x, z, y)];
        if (!light) { continue; }
        chunk.set_light_block(x, z, y, light);
        jobs.push([(chunk.x << 4) + x, (chunk.z << 4) + z, y]);
      }
    }
  }

  return jobs;
};

Map.prototype.spread_light_block = function spread_light_block(abs_x, abs_z, y, jobs, chunk) {
  if ((abs_x >> 4) !== chunk.x || (abs_z >> 4) !== chunk.z) {
    chunk = this.chunks[this.make_key(abs_x >> 4, abs_z >> 4)];
  }
  if (!chunk) {
    return;
  }

  var x = abs_x & 0x0f,
      z = abs_z & 0x0f;

  var s = chunk.get_light_block(x, z, y);

  this.spread_light_block_apply(abs_x - 1, abs_z,     y,     s, jobs, chunk);
  this.spread_light_block_apply(abs_x + 1, abs_z,     y,     s, jobs, chunk);
  this.spread_light_block_apply(abs_x,     abs_z - 1, y,     s, jobs, chunk);
  this.spread_light_block_apply(abs_x,     abs_z + 1, y,     s, jobs, chunk);

  if (y >   0) { this.spread_light_block_apply(abs_x, abs_z, y - 1, s, jobs, chunk); }
  if (y < 255) { this.spread_light_block_apply(abs_x, abs_z, y + 1, s, jobs, chunk); }
};

Map.prototype.spread_light_block_apply = function spread_light_block_apply(abs_x, abs_z, y, s, jobs, chunk) {
  if ((abs_x >> 4) !== chunk.x || (abs_z >> 4) !== chunk.z) {
    chunk = this.chunks[this.make_key(abs_x >> 4, abs_z >> 4)];
  }
  if (!chunk) {
    return;
  }

  var x = abs_x & 0x0f,
      z = abs_z & 0x0f;

  var reduction = light_block_stop[chunk.get_block_type(x, z, y)] + 1,
      result = Math.max(s - reduction, 0);

  var t = chunk.get_light_block(x, z, y);

  if (t < result) {
    chunk.set_light_block(x, z, y, result);
    jobs.push([abs_x, abs_z, y]);
  }
};
