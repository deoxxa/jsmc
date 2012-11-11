var Dissolve = require("dissolve"),
    util = require("util");

var Parser = module.exports = function Parser() {
  Dissolve.call(this);

  this.loop(function(end) {
    this.uint8("pid").tap(function() {
      switch (this.vars.pid) {
        case 0x00: this.uint32be("token"); break;
        case 0x01: this.uint32be("eid").mcstring16("level_type").uint8("game_mode").uint8("dimension").uint8("difficulty").uint8("junk").uint8("max_players"); break;
        case 0x02: this.uint8("protocol_version").mcstring16("username").mcstring16("server_host").uint32be("server_port"); break;
        case 0x03: this.mcstring16("message"); break;
        case 0x04: this.uint64be("time"); break;
        case 0x05: this.uint32be("eid").uint16be("slot").mcslot("item"); break;
        case 0x07: this.uint32be("user").uint32be("target").uint8("mouse"); break;
        case 0x0a: this.uint8("on_ground"); break;
        case 0x0b: this.doublebe("x").doublebe("y").doublebe("stance").doublebe("z").uint8("on_ground"); break;
        case 0x0c: this.floatbe("yaw").floatbe("pitch").uint8("on_ground"); break;
        case 0x0d: this.doublebe("x").doublebe("y").doublebe("stance").doublebe("z").floatbe("yaw").floatbe("pitch").uint8("on_ground"); break;
        case 0x0e: this.uint8("status").int32be("x").uint8("y").int32be("z").uint8("face"); break;
        case 0x0f: this.uint32be("x").uint8("y").uint32be("z").int8("direction").mcslot("slot").uint8("cursor_x").uint8("cursor_y").uint8("cursor_z"); break;
        case 0x10: this.int16be("slot_id"); break;
        case 0x12: this.uint32be("eid").uint8("animation"); break;
        case 0x13: this.uint32be("eid").uint8("action"); break;
        case 0x65: this.uint8("window_id"); break;
        case 0x66: this.uint8("window_id").int16be("slot").uint8("button").int16be("action").uint8("shift").mcslot("item"); break;
        case 0x6a: this.uint8("window_id").int16be("action").uint8("accepted"); break;
        case 0x6b: this.int16be("slot_id").mcslot("slot"); break;
        case 0x6c: this.uint8("window_id").uint8("enchantment"); break;
        case 0x82: this.int32be("x").uint16be("y").int32be("z").mcstring16("line_1").mcstring16("line_2").mcstring16("line_3").mcstring16("line_4"); break;
        case 0xca: this.uint8("flags").uint8("flying_speed").uint8("walking_speed"); break;
        case 0xcb: this.mcstring16("text"); break;
        case 0xcc: this.mcstring16("locale").uint8("view_distance").uint8("chat_flags").uint8("difficulty").uint8("show_cape"); break;
        case 0xcd: this.uint8("payload"); break;
        case 0xfa: this.mcstring16("channel").uint16be("data_length").buffer("data", "data_length"); break;
        case 0xfc: this.uint16be("secret_length").buffer("secret", "secret_length").uint16be("token_length").buffer("token", "token_length"); break;
        case 0xfe: this.uint8("magic"); break;
        case 0xff: this.mcstring16("message"); break;
      }
    }).tap(function() {
      this.emit("data", this.vars);
      this.vars = {};
    });
  });
};
util.inherits(Parser, Dissolve);

Parser.prototype.mcstring16 = function mcstring16(name) {
  var len = [name, "len"].join("_");

  return this.uint16be(len).tap(function() {
    this.buffer(name, this.vars[len] * 2).tap(function() {
      delete this.vars[len];

      for (var i=0;i<this.vars[name].length/2;++i) {
        var t = this.vars[name][i*2];
        this.vars[name][i*2] = this.vars[name][i*2+1];
        this.vars[name][i*2+1] = t;
      }

      this.vars[name] = this.vars[name].toString("ucs2");
    });
  });
};

Parser.prototype.mcslot = function mcslot(name) {
  return this.int16be("_block").tap(function() {
    if (this.vars._block === -1) {
      return;
    }

    this.uint8("_count").uint16("_damage").int16("_metadata_length").tap(function() {
      if (this.vars._metadata_length === -1) {
        return;
      }

      this.buffer("_metadata", "_metadata_length");
    });
  }).tap(function() {
    var slot = {
      block: this.vars._block,
      count: this.vars._count,
      damage: this.vars._damage,
      metadata: this.vars._metadata,
    };

    delete this.vars._block;
    delete this.vars._count;
    delete this.vars._damage;
    delete this.vars._metadata_length;
    delete this.vars._metadata;

    this.vars[name] = slot;
  });
};
