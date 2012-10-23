var connect = require('connect');
var socketio = require('socket.io');
var engine = require("./static/laserwar/engine").engine;
var rules = require("./static/laserwar/rules").rules;
var questions = Buffer(
    "<html>" +
        "<body style='font: 300% sans-serif'>" +
            "<div><a href='/auth/github'>Who am I on Github?</a></div>" +
            "<div><a href='/auth/google'>Who am I on Google?</a></div>" +
            "<div><a href='/auth/twitter'>Who am I on Twitter?</a></div>" +
        "</body>" +
    "</html>"
);

var server = connect()
	.use(function(req, res, next){
		console.log(req.originalUrl);
		next();
	})
    .use(connect.cookieParser())
    .use(connect.session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
    .use(function(req, res, next){
        if(req.originalUrl.indexOf("/editor/") == 0 && !req.session.hasIndentity){
//            res.writeHead(200, {
//                "Content-Type": "text/html",
//                "Content-Length": questions.length
//            });
//            res.end(questions);
            req.url = req.originalUrl = "/editor/signin.html";
            next();
        }
        else {
            next();
        }
    })
	.use(connect.static(__dirname + '/static')
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
		if(socket.game){
			console.log('disconnect');
			if(socket.game.player1 === socket){
				socket.game.player1 = null;
			}
			else if(socket.game.player2 === socket){
				socket.game.player2 = null;
			}
			if(waitingGame === socket.game){
				waitingGame = null;
			}
			else {
				
			}
		}
	});
});