var net = require("net"),
    events = require("events"),
    util = require("util");

var Parser = require("./parser"),
    Client = require("./client"),
    Serialiser = require("./serialiser");

var Server = module.exports = function Server() {
  events.EventEmitter.call(this);

  this.clients = [];
  this.socket = net.createServer(this.on_connection.bind(this));

  this.socket.on("listening", this.emit.bind(this, "server:listening"));
  this.socket.on("close", this.emit.bind(this, "server:close"));
};
util.inherits(Server, events.EventEmitter);

Server.prototype.on_connection = function on_connection(socket) {
  var client = new Client();
  this.clients.push(client);

  this.emit("client:connect", client);

  socket.pipe(new Parser()).pipe(client).pipe(new Serialiser()).pipe(socket);

  socket.on("close", function() {
    this.emit("client:disconnect", client);

    var index = this.clients.indexOf(client);
    if (index !== -1) {
      this.clients.splice(index, 1);
    }
  }.bind(this));
};

Server.prototype.listen = function listen() {
  this.socket.listen.apply(this.socket, arguments);
  return this;
};
