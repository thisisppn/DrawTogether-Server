// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var connected = [];
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
    
    var socketId = socket.id;
    connected.push(socketId);
    var connectedJson = JSON.stringify(connected);
    console.log(connectedJson);
    console.log(socketId+" connected");
    io.sockets.emit("connected", {
        ids: connectedJson,
        id: socketId
    });

    socket.on("touch", function (x, y){
        console.log("Touch event happened somewhere "+socketId);
        console.log(x+", "+y);
        socket.broadcast.emit("touch", {
            id: socketId,
            touchX: x,
            touchY: y
        });
    });
    
    
    socket.on("move", function (x, y){
        console.log("Move event happened somewhere "+socketId);
        console.log(x+", "+y);
        socket.broadcast.emit("move", {
            id: socketId,
            touchX: x,
            touchY: y 
        });
    });
    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        if (addedUser)
            return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });
});
