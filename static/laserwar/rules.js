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
	this.geometry = new THREE.CubeGeometry(1, (50 * 2.5 / 12), ((this.engine.width - 30) * 2.5) / 12);
	this.barHeight = 30;
	this.finished = false;
	this.modelIndex = -1;
	this.position = {x:0 , y: 0, z: -40};
	this.color = '#00F';
	this.initialized = false;
};
rules.prototype = new entity();

rules.prototype.initialize = function(){
	this.initialized = true;
	//this.engine.add( new menu({
	//}) );
	this.engine.canvasColor = '#000';
	this.engine.entities = [];
	this.engine.add(this);
	this.engine.gameState = {
		player1Ship: null,
		player2Ship: null,
		player3Ship: null,
		player4Ship: null,
		player1Score: 0,
		player2Score: 0
	};
	if(this.engine.mode == 'standalone' || this.engine.mode == 'client'){
		document.onkeydown = this.keyboardHandler.bind(this);
		this.engine.gameState.player1Remote = (location.hash == '#player1Remote');
		this.engine.gameState.player2Remote = (location.hash == '#player2Remote');
	}
	else{
		this.engine.gameState.player1Remote = true;
		this.engine.gameState.player2Remote = true;
	}
	if(this.engine.mode != 'server'){
		this.engine.remoteRenderer = [];
		this.engine.remoteRenderer.push(new ship({engine: this.engine}));
		this.engine.remoteRenderer.push(new laserbeam({engine: this.engine}));
		this.engine.remoteRenderer.push(new star({engine: this.engine}));
		this.engine.remoteRenderer.push(new ufo({engine: this.engine}));
		this.engine.remoteRenderer.push(new explosion({engine: this.engine}));
		this.engine.remoteRenderer.push(this);
	}
	if(this.crosshair){
		this.add(new crosshair() );
	}
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
		position    	: { x: this.engine.width / 2, y : (this.engine.height * 0.25) - this.barHeight },
		bottomOffset	: this.barHeight
	}) );
	this.engine.add( new star({
		name        	: 'Star 2',
		type        	: 'star',
		colorIndex  	: 3,
		direction   	: -1,
		position    	: { x: (this.engine.width / 2) , y : (this.engine.height * 0.75) - this.barHeight },
		bottomOffset	: this.barHeight
	}) );
};

rules.prototype.keyboardHandler = function(evt){
	// F1: Restart game single player mode, standalone (all runs on the client)
	if(event.keyCode == 112){
		this.engine.mode = 'standalone';
		this.engine.playerCount = 1;
		if(this.engine.entities.length == 0){
			this.engine.add(this);
		}
		this.initialized = false;
	}
	// F2: restart game multi player mode, 'client' only renders on the client, game logic runs on the server
	if(event.keyCode == 113){
		send('::rg'); // Sends request game message to the server (the server will start an engine on the server in 'server' mode)
		this.engine.mode = 'client';
		this.engine.entities = [];
	}
	// F3: Audio volume down
	if(event.keyCode == 114){
		audio.decreaseVolume();
	}
	// F4: Audio volume up
	if(event.keyCode == 115){
		audio.increaseVolume();
	}
	// F5: Mute
	if(event.keyCode == 116){
		audio.mute();
	}
	// F6: Restart game in zero player mode
	if(event.keyCode == 117){
		this.engine.mode = 'standalone';
		this.engine.playerCount = 0;
		if(this.engine.entities.length == 0){
			this.engine.add(this);
		}
		this.initialized = false;
	}
	// F7: Toggle Chat
	if(event.keyCode == 118){
		$(".chatcontainer").toggle();
	}
	// F8: Toggle settings
	if(event.keyCode == 119){
		$("#aiconfig").toggle();
		if(!engine.initializedAIConfigCombos){
			engine.initializedAIConfigCombos = true;
			for(var s in engine.ai){
				$('#player1ai').append("<option value='" + s + "'>" + s + "</option>");
				$('#player1ai').val(engine.player1ai);
			}
			$('#player1ai').change(function() {
				engine.player1ai = $(this).val();
			});
			for(var s in engine.ai){
				$("#player2ai").append("<option value='" + s + "'>" + s + "</option>");
				$('#player2ai').val(engine.player2ai);
			}
			$('#player2ai').change(function() {
				engine.player2ai = $(this).val();
			});
			for(var s in engine.rendering){
				$("#renderer").append("<option value='" + s + "'>" + s + "</option>");
				$('#renderer').val(engine.configuredRendering);
			}
			$('#renderer').change(function() {
				engine.configuredRendering = $(this).val();
			});
		}
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

// this.engine.mode == 'standalone' ? 'player' : (this.engine.player1 ? 'player' : 'computer'),
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
//	if(this.engine.player1Controls){
//		this.parseControlString(this.engine.player1Controls, "buttonDown", "mousePosition");
//		this.engine.player1Controls = "";
//	}
//	if(this.engine.player2Controls){
//		this.parseControlString(this.engine.player2Controls, "buttonDown2", "mousePosition2");
//		this.engine.player2Controls = "";
//	}

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
};

rules.prototype.render = function(time){
	this.renderRules(this.engine.gameState.player1Score, this.engine.gameState.player2Score);
};

rules.prototype.renderRules = function(player1Score, player2Score){
	this.position = {x: engine.configuredRendering === 'classic' ? 15 : 400 , y: this.engine.height - 62, z: -40};
	this.classicModel = [{x:0,y: 0,w: this.engine.width - 30, h: 50}];
	this.texts = [{
		font: '50px CBM64', 
		color: '#F00', 
		text: player1Score, 
		position: { 
			x: 20, 
			y: this.engine.height - 15
		} 
	}, {
		font: '50px CBM64', 
		color: '#FF0', 
		text: (player2Score < 10 ? ' ' : '') + player2Score, 
		position: { 
			x: this.engine.width - 95, 
			y: this.engine.height - 15
		} 
	}, {
		font: '50px CBM64', 
		color: '#FFF', 
		text: 'LASER WAR', 
		position: { 
			x: 230, 
			y: this.engine.height - 15
		} 
	}];
};

rules.prototype.getRemoteData = function(){
	/*return [
        5 , // type index (5 is rules)
        this.engine.gameState.player1Score ,
        this.engine.gameState.player2Score ,
        this.engine.canvasColor
    ];*/
	return "5," + this.engine.gameState.player1Score + "," +
	        this.engine.gameState.player2Score + "," +
	        this.engine.canvasColor;
};

rules.prototype.renderRemoteData = function(remoteData, offset){
	this.renderRules(parseFloat(remoteData[offset + 1]), parseFloat(remoteData[offset + 2]));
	this.engine.canvasColor = remoteData[offset + 3];
	return offset + 4;
};

if(typeof(exports) !== 'undefined'){
	exports.rules = rules;
}
