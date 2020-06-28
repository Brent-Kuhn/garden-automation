
// Handle new devices connecting to the server
function heartbeat(req, res, next) {
    // Calculate the time from now until next heartbeat
    timeSync = 3600000 - new Date().getTime() % 3600000;
    res.send(timeSync.toString());
  };
  
  module.exports = {
      heartbeat: heartbeat
  };