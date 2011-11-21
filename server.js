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
var waitingGame = null;

io.set('log level', 0);
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
				waitingGame.rules.startServerGame();
				socket.game = waitingGame;
			}
			else {
				waitingGame.player2 = socket;
				waitingGame.rules.startServerGame();
				socket.game = waitingGame;
				waitingGame = null;
			}
		} else {
			socket.game.rules.startServerGame();
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
	
	socket.on('debug', function (msg) {
		console.log(msg);
	});

	socket.on('disconnect', function () {
		
	});
});