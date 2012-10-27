var connect = require('connect');
var socketio = require('socket.io');
var engine = require('./static/laserwar/engine').engine;
var rules = require('./static/laserwar/rules').rules;
var authom = require('authom');
var config = require('./config');
var ajax = require('./lib/ajax');

try{
    var configLocal = require('./config.local');
    if(configLocal){
        config = configLocal;
    }
}
catch(exc){
    // Ignore missing local config file
}

var server = connect()
//	.use(function(req, res, next){
//		console.log(req.originalUrl);
//		next();
//	})
    .use(connect.cookieParser())
    .use(connect.session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
    .use(connect.bodyParser())
    .use(function(req, res, next){
        if(config.debug && !req.session.hasIndentity){
            req.session.hasIndentity = true;
            req.session.identity = config.debugUser;
        }
        if(req.originalUrl.indexOf('/editor/') == 0 && !req.session.hasIndentity){
            res.writeHead(302, {
                'Location': '/signin.html'
            });
            res.end();
        }
        else {
            next();
        }
    })
    .use(ajax({'/editor/behaviour': {
        getUserDetails: function(callback){
            callback(null, {name: this.session.identity.data.name || this.session.identity.data.screen_name});
        }
    }}))
	.use(connect.static(__dirname + '/static')
);

for(var i = 0, l = config.identityProviders.length; i < l; i++){
    authom.createServer(config.identityProviders[i]);
}

authom.on('auth', function(req, res, data) {
    req.session.hasIndentity = true;
    req.session.identity = data;
    res.writeHead(302, {
        'Location': '/editor/index.html'
    });
    res.end();
});

authom.on('error', function(req, res, data) {
    res.writeHead(302, {
        'Location': '/signin.html'
    });
    res.end();
});

authom.listen(server);
server.listen(8001);

var io = socketio.listen(8002);
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