// Test

HOST = null; // localhost
PORT = 8001;

// when the daemon started
var starttime = (new Date()).getTime();

var mem = process.memoryUsage();
// every 10 seconds poll for the memory.
//setInterval(function() {
//	mem = process.memoryUsage();
//}, 10 * 1000);

var fu = require("./fu"), 
	fs = require("fs"), 
	sys = require("sys"), 
	url = require("url"), 
	entity = require("./static/laserwar/entity").entity, 
	engine = require("./static/laserwar/engine").engine, 
	rules = require("./static/laserwar/rules").rules, 
	qs = require("querystring");

var MESSAGE_BACKLOG = 200, SESSION_TIMEOUT = 60 * 1000;

var games = {};

var channel = new function() {
	var messages = [], callbacks = [];

	this.appendMessage = function(nick, type, text) {
		var m = {
			nick : nick,
			type : type, // "msg", "join", "part"
			text : text,
			timestamp : (new Date()).getTime()
		};

		switch (type) {
		case "msg":
			// sys.puts("<" + nick + "> " + text);
			if (text.indexOf('::rg') == 0) {
				if (!games[nick]) {
					// first search game with available slot
					for(var s in games){
						if(!games[s].player1){
							games[nick] = games[s];
							games[nick].player1 = nick;
							games[nick].entities[0].initialized = false;
							break;
						}
						else if(!games[s].player2){
							games[nick] = games[s];
							games[nick].player2 = nick;
							games[nick].entities[0].initialized = false;
							break;
						}
					}
					if(!games[nick]){
						// If no existing game with an available slot was found, create a new game
						var settings = {
							player1 : nick,
							debug : false,
							width : 800,
							height : 600,
							pageColor : '#555',
							canvasColor : '#000',
							rulesType : rules,
							crosshair : true,
							mode : 'server' // 'client', 'server', 'standalone'
						};
						games[nick] = (new engine(settings));
						games[nick].channel = this;
					}
				} else {
					games[nick].entities[0].initialized = false;
				}
			} else if (text.indexOf('::r1') == 0) {
				var parts = text.substr(4).split(',');
				if(games[nick] && games[nick].player1 == nick){
//					games[nick].player1Controls = text.substr(4);
					games[nick].buttonDown = (parts[3] == 1);
					games[nick].mousePosition = {
						x : parseFloat(parts[1]),
						y : parseFloat(parts[2])
					};
				}
				else if(games[nick] && games[nick].player2 == nick){
//					games[nick].player2Controls = text.substr(4);
					games[nick].buttonDown2 = (parts[3] == 1);
					games[nick].mousePosition2 = {
						x : parseFloat(parts[1]),
						y : parseFloat(parts[2])
					};
				}
			} else {
				//sys.puts("<" + nick + "> " + text);
			}
			break;
		case "join":
			sys.puts(nick + " join");
			break;
		case "part":
			sys.puts(nick + " part");
			break;
		}

		messages.push(m);

		while (callbacks.length > 0) {
			callbacks.shift().callback([ m ]);
		}

		while (messages.length > MESSAGE_BACKLOG)
			messages.shift();
	};

	this.query = function(since, callback) {
		var matching = [];
		for ( var i = 0; i < messages.length; i++) {
			var message = messages[i];
			if (message.timestamp > since)
				matching.push(message);
		}

		if (matching.length != 0) {
			callback(matching);
		} else {
			callbacks.push({
				timestamp : new Date(),
				callback : callback
			});
		}
	};

	// clear old callbacks
	// they can hang around for at most 30 seconds.
	setInterval(
			function() {
				var now = new Date();
				while (callbacks.length > 0
						&& now - callbacks[0].timestamp > 30 * 1000) {
					callbacks.shift().callback([]);
				}
			}, 3000);
};

var sessions = {};

function createSession(nick) {
	if (nick.length > 50)
		return null;
	if (/[^\w_\-^!]/.exec(nick))
		return null;

	for ( var i in sessions) {
		var session = sessions[i];
		if (session && session.nick === nick)
			return null;
	}

	var session = {
		nick : nick,
		id : Math.floor(Math.random() * 99999999999).toString(),
		timestamp : new Date(),

		poke : function() {
			session.timestamp = new Date();
		},

		destroy : function() {
			channel.appendMessage(session.nick, "part");
			delete sessions[session.id];
		}
	};

	sessions[session.id] = session;
	return session;
}

// interval to kill off old sessions
setInterval(function() {
	var now = new Date();
	for ( var id in sessions) {
		if (!sessions.hasOwnProperty(id))
			continue;
		var session = sessions[id];

		if (now - session.timestamp > SESSION_TIMEOUT) {
			session.destroy();
		}
	}
}, 1000);

fu.listen(Number(process.env.PORT || PORT), HOST);

// Makes all files and folders for a given given folder available for
// static download. The files in the given folder are directly 'mounted'
// under the root of the virtual directory, to avoid naming collision make
// sure you distinct folder and file names.
function registerStatics(folder, isRoot, rootLessFolder) {
	var files = fs.readdirSync(folder);
	for ( var i = 0; i < files.length; i++) {
		var path = folder + "/" + files[i];
		var noRoot = rootLessFolder + "/" + files[i];
		var stat = fs.statSync(path);
		if (stat.isDirectory()) {
			registerStatics(path, false, noRoot);
		}
		if (stat.isFile()) {
			if (path.endsWith('/index.html')) {
				fu.get(rootLessFolder + "/", fu.staticHandler(path));
			}
			fu.get(noRoot, fu.staticHandler(path));
		}
	}
}

registerStatics('static', true, '');

fu.get("/who", function(req, res) {
	var nicks = [];
	for ( var id in sessions) {
		if (!sessions.hasOwnProperty(id))
			continue;
		var session = sessions[id];
		nicks.push(session.nick);
	}
	res.simpleJSON(200, {
		nicks : nicks,
		rss : mem.rss
	});
});

fu.get("/join", function(req, res) {
	var nick = qs.parse(url.parse(req.url).query).nick;
	if (nick == null || nick.length == 0) {
		res.simpleJSON(400, {
			error : "Bad nick."
		});
		return;
	}
	var session = createSession(nick);
	if (session == null) {
		res.simpleJSON(400, {
			error : "Nick in use"
		});
		return;
	}

	// sys.puts("connection: " + nick + "@" + res.connection.remoteAddress);

	channel.appendMessage(session.nick, "join");
	res.simpleJSON(200, {
		id : session.id,
		nick : session.nick,
		rss : mem.rss,
		starttime : starttime
	});
});

fu.get("/part", function(req, res) {
	var id = qs.parse(url.parse(req.url).query).id;
	var session;
	if (id && sessions[id]) {
		session = sessions[id];
		session.destroy();
	}
	res.simpleJSON(200, {
		rss : mem.rss
	});
});

fu.get("/recv", function(req, res) {
	if (!qs.parse(url.parse(req.url).query).since) {
		res.simpleJSON(400, {
			error : "Must supply since parameter"
		});
		return;
	}
	var id = qs.parse(url.parse(req.url).query).id;
	var session;
	if (id && sessions[id]) {
		session = sessions[id];
		session.poke();
	}

	var since = parseInt(qs.parse(url.parse(req.url).query).since, 10);

	channel.query(since, function(messages) {
		if (session)
			session.poke();
		res.simpleJSON(200, {
			messages : messages,
			rss : mem.rss
		});
	});
});

fu.get("/send", function(req, res) {
	var id = qs.parse(url.parse(req.url).query).id;
	var text = qs.parse(url.parse(req.url).query).text;

	var session = sessions[id];
	if (!session || !text) {
		res.simpleJSON(400, {
			error : "No such session id"
		});
		return;
	}

	session.poke();

	channel.appendMessage(session.nick, "msg", text);
	res.simpleJSON(200, {
		rss : mem.rss
	});
});
