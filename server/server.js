'use strict';
var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();
var users = [];
var connections = [];
var messages = [];
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
    // app.io = require('socket.io')(app.start());

    /** ************************************************ */
    var io = require('socket.io').listen(app.start());
    io.sockets.on('connection', (socket)=>{
      connections.push(socket);
      console.log('Connected %s sockets connected', connections.length);
      // Disconnect
      socket.on('disconnect', (data)=>{
        // Deletes the disconnected user from the users array
        // users.splice(users.indexOf(socket.username), 1);
        // updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected %s sockets connected', connections.length);
      });
      // Send Message to Implement later
      /* socket.on('send message', (data)=>{
        //console.log(data);
        io.sockets.emit('new message', {msg: data, user: socket.username});
        messages.push({msg: data, user: socket.username});
      }); */

      socket.on('send message', (data)=>{
        // console.log(data);
        io.sockets.emit('new message', {message: data.message, nickname: data.nickname});
        // messages.push({msg: data, user: socket.username});
      });
      // New User
      /* socket.on('new user', (data, callback) => {
        callback(true);
        socket.username = data;
        //console.log(data);
        users.push(socket.username);
        //reloadMessages();
        //updateUsernames();
      }); */
      // Update all the users each connection
      function updateUsernames() {
        io.sockets.emit('get users', users);
      };

      function reloadMessages() {
        io.sockets.emit('get messages', messages);
        // socket.broadcast.emit('get messages', messages);
      };
    });

    /** ************************************************* */

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

    /* let sockets = new Set();
    app.io.on('connection', function(socket) {
      sockets.add(socket);
      console.log(`Socket ${socket.id} added`);
        .on('clientmessage', message => {
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
    });*/
  }
});
