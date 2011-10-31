var connect = require('connect');
var socketio = require('socket.io');
var engine = require("./static/laserwar/engine").engine;
var rules = require("./static/laserwar/rules").rules;

var server = connect.createServer(
    connect.static(__dirname + '/static')
);
server.listen(8001);

var server = connect();
var io = socketio.listen(8002); 
var nicknames = {};
var games = [];
var waitingGame = null;

io.sockets.on('connection', function (socket) {

	// Client requests new server side multiple player game
	socket.on('start game', function () {
		if (!socket.game) {
			// first search game with available slot
			if(!waitingGame){
				// If no existing game with an available slot was found, create a new game
				var settings = {
					player1 : socket,
					rulesType: rules,
					mode : 'server'
				};
				waitingGame = (new engine(settings));
				socket.game = waitingGame;
				games.push(socket.game);
			}
			else {
				waitingGame.player2 = socket;
				waitingGame.entities[0].initialized = false;
				socket.game = waitingGame;
				waitingGame = null;
			}
		} else {
			socket.game.entities[0].initialized = false;
		}
	});
	
	// Receiving data describing the client's controller state
	socket.on('controller state', function (msg) {
		var parts = msg.split(',');
		if(socket.game){
			var button = (parts[2] == 1);
			var position = {
				x : parseFloat(parts[0]),
				y : parseFloat(parts[1])
			};
			if(socket.game.player1 == socket){
				socket.game.buttonDown = button;
				socket.game.mousePosition = position;
			}
			else if(socket.game.player2 == socket){
				socket.game.buttonDown2 = button;
				socket.game.mousePosition2 = position;
			}
		}
	});

	socket.on('disconnect', function () {

	});
});