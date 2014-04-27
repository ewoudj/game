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

var initAudio = function(){
    // Used to make sure audio is initialized on iOS (must be triggered by an event)
    try{
        if(window.audio){
            window.audio.appearAudio.play();
        }
    }catch(ex){
    }
}

var mainMenu = {
    '    SINGLE PLAYER': {
        onMousePlaneUp: function (entity, evt) {
            initAudio();
            entity.engine.rules.startSinglePlayerGame();
        }
    },
    '    MULTI  PLAYER': {
        onMousePlaneUp: function (entity, evt) {
            initAudio();
            entity.engine.rules.startMultiPlayerGame();
        }
    },
    '':{},
    '    SETTINGS': {
        onMousePlaneUp: function (entity, evt) {
            initAudio();
            //entity.engine.rules.toggleSettings();
        	entity.engine.rules.menu.setItems(settingsMenu);
        }
    }//,
    //'CREDITS': {}
};

var settingsMenu = {
	'AUDIO': {
		onMousePlaneUp: function (entity, evt) {
    		if(engine.getItem("effectsVolume",'0') === '0'){
        		engine.effectsVolume = 10;
        	}
        	else{
        		engine.effectsVolume = 0;
        	}
    		// Persist the setting
    		engine.setItem('effectsVolume', engine.effectsVolume);
    		window.audio.setVolume(engine.effectsVolume);
    		// Update the menu (so it now correctly says 2d/3d)
    		entity.engine.rules.menu.setItems(settingsMenu);
        },
        getText: function(menu){
        	var result;
        	if(engine.getItem("effectsVolume",'0') === '0'){
        		result = '      AUDIO: OFF';
        	}
        	else{
        		result = '      AUDIO:  ON';
        	}
        	return result; 
        }
    },
    'VIDEO': {
    	onMousePlaneUp: function (entity, evt) {
    		if(engine.getItem("renderer",'classic') === 'classic'){
                var webglAvailable = false;
                var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
                if(!iOS){
                    webglAvailable = ( function () {
                        try {
                            return (!! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ));
                        } catch( e ) {
                            return false;
                        }
                    } )();
                    if(webglAvailable){
                        engine.renderer = 'webgl';
                    }
                    else{
                        engine.renderer = 'classic';
                    }
                }
            }
        	else{
        		engine.renderer = 'classic';
        	}
    		// Persist the setting
    		engine.setItem('renderer', engine.renderer);
    		// Update the menu (so it now correctly says 2d/3d)
    		entity.engine.rules.menu.setItems(settingsMenu);
        },
        getText: function(menu){
        	var result;
        	if(engine.getItem("renderer",'classic') === 'classic'){
        		result = '      VIDEO:  2D';
        	}
        	else{
        		result = '      VIDEO:  3D';
        	}
        	return result; 
        }
    },
    '': {},
    '      MAIN MENU': {
        onMousePlaneUp: function (entity, evt) {
            entity.engine.rules.menu.setItems(mainMenu);
        }
    }
};

var gameOverMenu = {
    '      GAME OVER': {},
    '': {},
    '      PLAY AGAIN': {
        onMousePlaneUp: function (entity, evt) {
            entity.engine.rules[entity.engine.rules.currentGameType]();
        }
    },
    '      MAIN MENU': {
        onMousePlaneUp: function (entity, evt) {
            entity.engine.rules.menu.setItems(mainMenu);
        }
    }
};

var introMenu = {
    '  LASER WAR': {},
    '': {},
    '  RIGHT CLICK': {},
    '  FOR MENU': {}
};

if(typeof(exports) !== 'undefined'){
	exports.colors = colors;
}

var rules = function(config){
	helpers.apply(config, this);
	this.initialized = false;
	this.engineId = 0; // This is important, if it is not 0 an new rules object gets created on the client
	this.name = 'rules';
	this.barHeight = 30;
	if(this.engine.mode !== 'server'){
		var self = this;
		var uphandler = function(){self.keyboardHandler();};
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
	this.previousRightButtonDown = false;
	this.initialized = true;
	this.engine.canvasColor = '#000';
	this.engine.gameState = {
		player1Ship: null,
		player2Ship: null,
		player3Ship: null,
		player4Ship: null,
		player1Score: 0,
		player2Score: 0,
		gameOver: false
	};
	if(this.engine.mode !== 'server'){
		this.scoreBar = new scorebar({
			engine: this.engine
		});
		this.engine.add(this.scoreBar);
		if(!this.menu){
			this.menu = new menu({
				engine: this.engine,
				mainMenu: mainMenu
			});
			this.engine.add(this.menu);
			this.menu.setItems(mainMenu);
		}
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
		var playerstar = null;
		// If the player is a computer (AI) help it start a new ship.
		// This should be replaced by the AI doing a proper mouseposition and button click
		if(ship.type === 'computer' || this.engine.touchController.touchable){
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
	if(this.engine.mode !== 'server'){
		if(this.engine.gameState.gameOver !== this.previousGameOverState){
			this.previousGameOverState = this.engine.gameState.gameOver;
			if(this.engine.gameState.gameOver && (this.engine.playerCount > 0 || this.engine.mode === 'client')){
				this.showGameOver();
			}
			else if(this.engine.gameState.gameOver && this.engine.playerCount === 0){
				if(this.menu.finished){
					this.engine.reset();
				}
				else{
					this.engine.reset(this.menu);
				}
				return;
			}
			else if(this.engine.mode === 'client'){
				this.hideMenu();
			}
		}
		this.scoreBar.setScore(this.engine.gameState.player1Score, this.engine.gameState.player2Score);
		if(this.previousRightButtonDown !== this.engine.rightButtonDown){
			if(this.engine.rightButtonDown === false){
				this.toggleMenu();
			}
			this.previousRightButtonDown = this.engine.rightButtonDown;
		}
	}
	if(this.engine.mode !== 'client'){
		var maxScore = this.engine.playerCount === 0 ? engine.maxAiScore : engine.maxScore;
		this.engine.gameState.gameOver = (this.engine.gameState.player1Score === maxScore 
										|| this.engine.gameState.player2Score === maxScore);
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
	}
};

rules.prototype.getRemoteData = function(){
	var result = null;
	var newMessage = "5," + this.engine.gameState.player1Score + "," +
	        this.engine.gameState.player2Score + "," +
	        (this.engine.gameState.gameOver ? 1 : 0);
	if(newMessage !== this.previousMessage){
		result = this.previousMessage = newMessage;
	}
	return result;
};

rules.prototype.renderRemoteData = function(remoteData, offset){
	this.engine.gameState.player1Score = remoteData[offset + 1];
	this.engine.gameState.player2Score = remoteData[offset + 2];
	this.engine.gameState.gameOver = (remoteData[offset + 3] === "1");
	return offset + 4;
};

rules.prototype.startSinglePlayerGame = function(){
	this.currentGameType = "startSinglePlayerGame";
	this.engine.mode = 'standalone';
	this.engine.playerCount = 1;
	this.engine.reset();
    this.hideMenu();
};

rules.prototype.startMultiPlayerGame = function () {
	this.currentGameType = "startMultiPlayerGame";
    // Sends request game message to the server (the server will start an engine on the server in 'server' mode)
	if(this.engine.socket){
		this.engine.socket.emit('start game', 'foo', 'bar');
		this.engine.mode = 'client';
		this.hideMenu();
	}
	else{
		alert('Multiplayer is currently not available.');
	}
};

rules.prototype.startServerGame = function () {
    this.engine.mode = 'server';
    if(this.engine.player1){
    	this.engine.player1.emit('reset', 0);
    }
    if(this.engine.player2){
    	this.engine.player2.emit('reset', 0);
    }
    this.engine.reset();
};

rules.prototype.startZeroPlayerGame = function () {
	this.currentGameType = "startZeroPlayerGame";
    this.engine.mode = 'standalone';
    this.engine.playerCount = 0;
    this.engine.reset();
    this.hideMenu();
};

rules.prototype.showGameOver = function () {
    this.showMenu(gameOverMenu);
};

rules.prototype.showMenu = function (items) {
	return this.menu.show(items);
};

rules.prototype.toggleMenu = function () {
    return this.menu.toggle();
};

rules.prototype.hideMenu = function () {
    return this.menu.hide();
};

rules.prototype.toggleSettings = function () {
    DAT.GUI.toggleHide();
};

rules.prototype.keyboardHandler = function (evt) {
	evt = evt || window.event;
	var keyCode = evt.keyCode || evt.which;
    // 1: Restart game single player mode, standalone (all runs on the client)
    if (keyCode == 49) {
        this.startSinglePlayerGame();
    }
    // 2: restart game multi player mode, 'client' only renders on the client, game logic runs on the server
    if (keyCode == 50) {
    	this.startMultiPlayerGame();
    }
    // 3: Audio volume down
    if (keyCode == 51) {
        audio.decreaseVolume();
    }
    // 4: Audio volume up
    if (keyCode == 52) {
        audio.increaseVolume();
    }
    // 5: Mute
    if (keyCode == 53) {
        audio.mute();
    }
    // 6: Restart game in zero player mode
    if (keyCode == 54) {
    	this.startZeroPlayerGame();
    }
//    // F8: Toggle settings
//    if (keyCode === 119 || keyCode === 192) {
//        DAT.GUI.toggleHide();
//    }
    // M: Toggle menu
    if (keyCode === 77) {
    	if(this.menu.currentItems === introMenu){
    		this.menu.gotoRoot();
    	}
    	else{
    		this.toggleMenu();
    	}
    }
};


if(typeof(exports) !== 'undefined'){
	exports.rules = rules;
}
