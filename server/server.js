'use strict';
var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();
app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};
boot(app, __dirname, function(err) {
  if (err) throw err;
  // start the server if `$ node server.js`
  if (require.main === module) {
    // Comment this app.start line and add following lines
    // app.start();
    app.io = require('socket.io')(app.start());
    /* require('socketio-auth')(app.io, {
      authenticate: function (socket, value, callback) {
        console.log('socket', socket);
        console.log('value', value);
        var AccessToken = app.models.AccessToken;
        //get credentials sent by the client
        var token = AccessToken.find({
          where:{
            and: [{ userId: value.userId }, { id: value.id }]
          }
        }, function(err, tokenDetail){
          console.log('tokenDetail', tokenDetail);
          if (err) throw err;
          if(tokenDetail.length){
            callback(null, true);
          } else {
            callback(null, false);
          }
        }); //find function..
      } //authenticate function..
    }); */

    let sockets = new Set();
    app.io.on('connection', function(socket) {
      sockets.add(socket);
      console.log(`Socket ${socket.id} added`);
      socket.on('clientmessage', message => {
        console.log('clientmessage', message);
        for (const s of sockets) {
          s.emit('message', {msg: message});
        }
      });
      socket.on('clientdata', data => {
        console.log('clientdata', data);
        let message = {
          nickname: socket.id,
          message: data,
        };
        for (const s of sockets) {
          s.emit('message', {msg: message});
        }
      });
      socket.on('disconnect', () => {
        console.log(`Deleting socket: ${socket.id}`);
        sockets.delete(socket);
        console.log(`Remaining sockets: ${sockets.size}`);
      });
    });
  }
});
