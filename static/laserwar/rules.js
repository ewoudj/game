if(typeof(require) !== 'undefined'){
	var entity = require("./entity").entity;
	var helpers = require("./helpers").helpers;
	var ship = require("./ship").ship;
	var star = require("./star").star;
	var ufo = require("./ufo").ufo;
	var engine = require("./engine").engine;
}

// On update check colorsBinary table in the webgl renderer
var colors = [
   '#F00', // Red
   '#0F0', // Green
   '#0FF', // Cyan
   '#FF0', // Yellow
   '#F0F', // Purple
   '#00F', // Blue
   '#AAA' // 'Grey'
];

if(typeof(exports) !== 'undefined'){
	exports.colors = colors;
}

var rules = function(config){
	helpers.apply(config, this);
	this.initialized = false;
	this.name = 'rules';
	this.barHeight = 30;
	if(this.engine.mode !== 'server'){
		var uphandler = this.keyboardHandler.bind(this);
		if(document.addEventListener) { // Opera - Firefox - Google Chrome
			document.addEventListener("keyup", uphandler, false);
		}
		else if(document.attachEvent) { // Internet Explorer
			document.attachEvent("onkeyup", uphandler);
		}
		else if(!document.onkeydown && !document.onkeyup) {
			document.onkeyup = uphandler;
		}
	}
};
rules.prototype = new entity();

rules.prototype.initialize = function(){
	this.initialized = true;
	this.engine.canvasColor = '#000';
	this.engine.gameState = {
		player1Ship: null,
		player2Ship: null,
		player3Ship: null,
		player4Ship: null,
		player1Score: 0,
		player2Score: 0
	};
	if(this.engine.mode !== 'server'){
		this.scoreBar = this.scoreBar || new scorebar({
			engine: this.engine
		});
		this.engine.add(this.scoreBar);
		this.menu = this.menu || new menu({
			engine: this.engine
		});
		this.engine.add(this.menu);
	}
	if(this.engine.mode !== 'client'){
		this.engine.add( this.engine.gameState.player1Ship = new ship({
			name        : 'Player 1',
			type		: this.engine.mode == 'standalone' ? (this.engine.playerCount === 0 ? 'computer' : 'player') : (this.engine.player1 ? 'player' : 'computer'),
			direction   : 1,
			colorIndex  : 0,
			position    : { x: 10, y : 10 }
		}) );
		// Player 2
		this.engine.add( this.engine.gameState.player2Ship = new ship({
			name        : 'Player 2',
			type        : this.engine.mode == 'standalone' ? (this.engine.playerCount !== 2 ? 'computer' : 'player') : (this.engine.player2 ? 'player' : 'computer'),
			colorIndex  : 3,
			direction   : -1,
			position    : { x: this.engine.width - 40, y : (this.engine.height - 50 - this.barHeight) }
		}) );
		// Stars 
		this.engine.add( new star({
			name        	: 'Star 1',
			type        	: 'star',
			colorIndex  	: 0,
			direction   	: -1,
			starId			: 0,
			position    	: { x: this.engine.width / 2, y : (this.engine.height * 0.25) - this.barHeight },
			bottomOffset	: this.barHeight
		}) );
		this.engine.add( new star({
			name        	: 'Star 2',
			type        	: 'star',
			colorIndex  	: 3,
			direction   	: -1,
			starId			: 5,
			position    	: { x: (this.engine.width / 2) , y : (this.engine.height * 0.75) - this.barHeight },
			bottomOffset	: this.barHeight
		}) );
	}
};

// Checks to see if the players mouse pointer is over a star
// with the players color. Returns the star entity.
rules.prototype.getStar = function(player, considerMouse, mousePosition){
	for(var i = 0; i < this.engine.entities.length; i++){
		if(this.engine.entities[i].type == 'star' && this.engine.entities[i].colorIndex == player.colorIndex){
			if(!considerMouse || this.engine.entities[i].collidesWith({position: mousePosition, collisionRect: {x:-20,y:-20,w:40,h:40}})){
				return this.engine.entities[i];
			}
		}
	}
	return null;
};

rules.prototype.spawnPlayerShip = function(playerShip, button, name, type, direction, colorIndex, position){
	var result = playerShip;
	if(playerShip.finished && ((button && type == 'player') || type == 'computer') ){
		var shipStar = this.getStar(playerShip, (type == 'player'), position);
		if(shipStar){
			result = new ship({
				name        : name,
				type		: type,
				direction   : direction,
				colorIndex  : colorIndex,
				position    : position,
				spawnStar	: shipStar
			});
			this.engine.add( result );
		}
	}
	return result;
};

rules.prototype.parseControlString = function(s, buttonName, positionName){
	var parts = s.split(',');
	this.engine[positionName] = {
		x : parseFloat(parts[1]),
		y : parseFloat(parts[2])
	};
	this.engine[buttonName] = (parts[3] == 1);
};

rules.prototype.ensureUserRespawn = function(ship, mousePosition, buttonDown, playerName, direction, color){
	var result = ship;
	if(ship && ship.finished){
		var position = { x: mousePosition.x, y : mousePosition.y };
		var playerstar;
		// If the player is a computer (AI) help it start a new ship.
		// This should be replaced by the AI doing a proper mouseposition and button click
		if(ship.type === 'computer'){
			// See if there is a star in the ship's color
			playerstar = this.getStar(ship, false);
			if(playerstar){
				// If so set the ship's spawn position to the center of the star
				position = helpers.ceilPoint({ 
					x: playerstar.position.x , 
					y: playerstar.position.y 
				});
			}
		}
		if(ship.type === 'player' || ( ship.type === 'computer' && playerstar )){
			result = this.spawnPlayerShip(
					ship, 
					buttonDown,
					playerName,
					ship.type,
					direction,
					color,
					position
			);
		}
	}
	return result;
};

rules.prototype.update = function(time){
	if(!this.initialized){
		this.initialize();
	}
	if(this.engine.mode !== 'client'){
		this.engine.gameState.player1Ship = this.ensureUserRespawn(
				this.engine.gameState.player1Ship, 
				this.engine.mousePosition, this.engine.buttonDown, 'Player 1', 1, 0);
		
		this.engine.gameState.player2Ship = this.ensureUserRespawn(
				this.engine.gameState.player2Ship, 
				this.engine.mousePosition2, this.engine.buttonDown2, 'Player 2', -1, 3);
		
		// Randomly create UFOs when they do not exist
		if((!(this.engine.gameState.player3) || (this.engine.gameState.player3 && this.engine.gameState.player3.finished)) && 6 == Math.floor(Math.random()*200)){
			this.engine.add( this.engine.gameState.player3 = new ufo({
				name        : 'Player 3',
				type        : 'computer',
				colorIndex  : 2,
				direction   : -1,
				position    : { x: this.engine.width - 40, y : 10 }
			}));		
		}
		if((!(this.engine.gameState.player4) || (this.engine.gameState.player4 && this.engine.gameState.player4.finished)) && 6 == Math.floor(Math.random()*200)){
			this.engine.add( this.engine.gameState.player4 = new ufo({
				name        : 'Player 4',
				type        : 'computer',
				colorIndex  : 4,
				direction   : -1,
				position    : { x: 10, y : (this.engine.height - 50 - this.barHeight) }
			}));		
		}
		if(this.engine.mode == 'standalone' || this.engine.mode == 'client'){
			this.scoreBar.setScore(this.engine.gameState.player1Score, this.engine.gameState.player2Score);
		}
	}
};

rules.prototype.getRemoteData = function(){
	var result = null;
	var newMessage = "5," + this.engine.gameState.player1Score + "," +
	        this.engine.gameState.player2Score + "," +
	        this.engine.canvasColor;
	if(newMessage !== this.previousMessage){
		result = this.previousMessage = newMessage;
	}
	return result;
};

rules.prototype.renderRemoteData = function(remoteData, offset){
	if(!this.scoreBar){
		this.scoreBar = new scorebar({
			engine: this.engine
		});
		this.engine.add(this.scoreBar);
	}
	this.scoreBar.setScore(parseInt(remoteData[offset + 1]), parseInt(remoteData[offset + 2]));
	this.engine.canvasColor = remoteData[offset + 3];
	return offset + 4;
};

rules.prototype.startSinglePlayerGame = function(){
	this.engine.mode = 'standalone';
	this.engine.playerCount = 1;
	this.engine.reset();
    this.hideMenu();
};

rules.prototype.startMultiPlayerGame = function () {
    // Sends request game message to the server (the server will start an engine on the server in 'server' mode)
    this.engine.socket.emit('start game', 'foo', 'bar');
    this.engine.mode = 'client';
    this.hideMenu();
};

rules.prototype.startServerGame = function () {
    this.engine.mode = 'server';
    if(this.engine.player1 && this.engine.player2){
    	//this.engine.playerCount = 2;
    	this.engine.player1.emit('reset', 0);
    	this.engine.player2.emit('reset', 0);
    }
    else{
    	// this.engine.playerCount = 1;
    	this.engine.player1.emit('reset', 0);
    }
    if (this.engine.entities.length === 0) {
        //this.engine.add(this);
    }
    this.engine.reset();
};

rules.prototype.startZeroPlayerGame = function () {
    this.engine.mode = 'standalone';
    this.engine.playerCount = 0;
    this.engine.reset();
    this.hideMenu();
};

rules.prototype.toggleMenu = function () {
    if (this.menu.finished) {
        this.menu.finished = false;
        this.engine.add(this.menu);
        this.menu.gotoRoot();
    }
    else {
        this.menu.finished = true;
    }
};

rules.prototype.hideMenu = function () {
    this.menu.finished = true;
};

rules.prototype.toggleSettings = function () {
    DAT.GUI.toggleHide();
};

rules.prototype.keyboardHandler = function (evt) {
	var evt = evt || window.event;
	var keyCode = evt.keyCode || evt.which;
    // F1: Restart game single player mode, standalone (all runs on the client)
    if (keyCode == 112) {
        this.startSinglePlayerGame();
    }
    // F2: restart game multi player mode, 'client' only renders on the client, game logic runs on the server
    if (keyCode == 113) {
    	this.startMultiPlayerGame();
    }
    // F3: Audio volume down
    if (keyCode == 114) {
        audio.decreaseVolume();
    }
    // F4: Audio volume up
    if (keyCode == 115) {
        audio.increaseVolume();
    }
    // F5: Mute
    if (keyCode == 116) {
        audio.mute();
    }
    // F6: Restart game in zero player mode
    if (keyCode == 117) {
    	this.startZeroPlayerGame();
    }
    // F8: Toggle settings
    if (keyCode === 119 || keyCode === 192) {
        DAT.GUI.toggleHide();
    }
    // F8: Toggle menu
    if (keyCode === 27) {
        this.toggleMenu();
    }
};


if(typeof(exports) !== 'undefined'){
	exports.rules = rules;
}
