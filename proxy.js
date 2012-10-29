#!/usr/bin/env node

var net = require("net");

var server = net.createServer(function(local) {
  var remote = net.createConnection(process.argv[3], process.argv[4]);

  local.on("error", function(err) {
    console.log("<", err);
  });

  remote.on("error", function(err) {
    console.log(">", err);
  });

  local.pipe(remote).pipe(local);

  local.on("data", function(data) {
    console.log("<", data.toString("hex"));
  });

  remote.on("data", function(data) {
    console.log(">", data.toString("hex"));
  });
});
server.listen(process.argv[2]);
