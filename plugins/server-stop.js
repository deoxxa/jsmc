module.exports = function() {
  return function(game) {
    process.on('SIGINT', function () {

      console.log("\nServer is shutting down....");
      
      game.clients.forEach(function(client) {
        client.emit("data", {
          pid: 0xff,
          message: "Server is shutting down."
        });
      });

      process.exit();
    });
  };
};
