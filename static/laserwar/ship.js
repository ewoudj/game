/*
 *   User ship
 */
if(typeof(require) !== 'undefined'){
	var helpers = require("./helpers").helpers;
	var entity = require("./entity").entity;
	var explosion = require("./explosion").explosion;
	var colors;
	var sys = require("sys");
	for(var s in colors){
		sys.puts(s);
	};
	var laserbeam = require("./laserbeam").laserbeam;
	// AI
	var engine = require("./engine").engine;
	require('./ai/heuristic.js');
	require('./ai/prioritizing.js');
}

var ship = function(config){
	helpers.apply(config, this);
	this.type = this.type || 'player'; // player, computer
	this.laserState = 300; // 10 = ready, 0 = charging
	this.direction = this.direction || 1;
	this.colors = colors ? colors : require("./rules").colors;
	this.color = this.colors[this.colorIndex] || this.color || "#FFF";
	this.speed = 3;
	this.colorLoop = 0;
	this.invulerability = 1000;
	this.audioDone = false;
	this.name = this.name || 'ship';
	this.position = this.position || {x:0, y:0};
	this.gunOffset =  {x:40, y: 0};
	this.collisionRect = {x: -15, y: -10, w: 30,h: 20};
	this.modelIndex = 0;
	this.rectsRight = [
		{x: -20, y: -15, w: 20, h: 10},
		{x: -10, y: -5, w: 30, h: 10},
		{x: -20, y: 5, w: 20, h: 10}
	];
	this.rectsLeft = [
		{x: 0, y: -15, w: 20, h: 10},
		{x: -20, y: -5, w: 30, h: 10},
		{x: 0, y: 5, w: 20, h: 10}
	];
};

ship.prototype = new entity();

ship.prototype.getTimeDelta = function(){
	if(!this.lastTimeCalled){
		this.lastTimeCalled = time;
	}
	var timeDelta = time - this.lastTimeCalled;
	this.lastTimeCalled = time;
	return timeDelta;
};

ship.prototype.update = function(time){
	var timeDelta = this.getTimeDelta();
	if(this.engine.mode !== 'client'){
		if(this.invulerability){
			this.invulerability -= timeDelta;
			if(this.invulerability < 0){
				this.invulerability = 0;
			}
		}
//		if(!this.engine.gameState.gameOver && (this.collisions && this.collisions.length)){
//			for(var i = 0; i < this.collisions.length; i++){
//				if(this.collisions[i].owner != this && !(this.invulerability && this.collisions[i] == this.spawnStar)){
//					if(!this.finished && this.collisions[i].owner == this.engine.gameState.player1Ship && this == this.engine.gameState.player2Ship){
//						this.engine.gameState.player1Score++;
//					}
//					if(!this.finished && this.collisions[i].owner == this.engine.gameState.player2Ship && this == this.engine.gameState.player1Ship){
//						this.engine.gameState.player2Score++;
//					}
//					this.finished = true;
//				}
//			}
//		}
		if(this.collisions && this.collisions.length){
			for(var i = 0; i < this.collisions.length; i++){
				var collider = this.collisions[i];
				if(collider.owner != this && !(this.invulerability && collider == this.spawnStar)){
					if(collider.parent && collider.type === 'star' && collider.color !== this.color){
						collider.finished = true;
					}
					this.finished = true;
					break;
				}
			}
		}
		this.updateControllerState();
	}
	this.move(timeDelta);
	if(this.engine.mode !== 'client'){
		this.updateLaser(timeDelta);
	}
};

ship.prototype.onRemove = function(){
	if(this.engine.mode !== 'server'){
		// The server does not care about the explosion as it is just a visual
		this.engine.add(new explosion({
			position: this.position
		}));
	}
};

ship.prototype.move = function(timeDelta){
	var previousPosition = this.position;
	this.position = this.calculateMovement(this.position, this.mousePosition, 10, timeDelta);
	if(this.position.x > previousPosition.x){
		this.direction = 1;
	}
	else if(this.position.x < previousPosition.x){
		this.direction = -1;
	}
	this.classicModel = this.direction === 1 ? this.rectsRight : this.rectsLeft;
};

ship.prototype.updateLaser = function(timeDelta){
	if(this.shoot && this.laserState >= 300){
		this.laserState = 0;
		this.gunOffset.x = this.direction === 1 ? 40 : -40;
		this.engine.add(new laserbeam({
			position: {x:this.position.x + this.gunOffset.x, y:this.position.y + this.gunOffset.y},
			direction: this.direction,
			owner: this
		}));
	}
	else if(this.laserState < 300){
		this.laserState = this.laserState + timeDelta;
	}
	else{
		this.laserState = 300;
	}
};

ship.prototype.updateControllerState = function(){
	// This will determine, for every ship, the state of the related controller
	// Specifically it will set the 'shoot' and 'mousePosition' values.
	this.shoot = false;
	if(this.type != 'computer'){
		// If the player is a human, get the controller values from the engine
		// This works the same for the server and the stand-alone modes.
		if(this.engine.mode == 'standalone' || (this.name == "Player 1" && this.engine.player1)){
			this.shoot = this.engine.buttonDown;
			this.mousePosition = this.engine.mousePosition;
			
		}
		else if(this.name == "Player 2" && this.engine.player2){
			this.shoot = this.engine.buttonDown2;
			this.mousePosition = this.engine.mousePosition2;
		}
	}
	else if(this.type == 'computer'){
		// In the case of AI the active AI will set the controller 
		var controls;
		if(this.name === 'Player 1'){
			controls = engine.ai[engine.player1ai].call(this);
		}
		else {
			controls = engine.ai[engine.player2ai].call(this);
		}
		this.mousePosition = controls.mousePosition;
		this.shoot = controls.shoot;
	}
};

ship.prototype.calculateMovement = function(currentPosition, mousePosition, speedLimit, timeDelta){
	var deltaX = mousePosition.x - currentPosition.x;
	var deltaY = mousePosition.y - currentPosition.y;
	var distance = helpers.distance(currentPosition, mousePosition);
	var f = 0.25;
	var speed = speedLimit * (timeDelta / 40);
	if(distance > 5){
		f = 5 / distance;
	}
	return {
		x: this.position.x + (deltaX * f),
		y: this.position.y + (deltaY * f)
	};
};

ship.prototype.render = function(){
	if(!this.audioDone){
		this.audioDone = true;
		try{
		if(audio){
			audio.appearAudio.play();
		}}catch(ex){}
	}
};

ship.prototype.getRemoteData = function(){
	if(this.mousePosition){
		var mouseX = Math.ceil(this.mousePosition.x);
		var mouseY = Math.ceil(this.mousePosition.y);
		if(!this.previousMousePosition || mouseX !== this.previousMousePosition.x || mouseY !== this.previousMousePosition.y){
			this.previousMousePosition = {
				x: mouseX,
				y: mouseY
			};
			var result = "0," + Math.ceil(this.position.x) + "," +
			              Math.ceil(this.position.y) + "," +
			              this.colorIndex + "," + 
		        		  mouseX + "," +
			              mouseY;
		}
	}
	return result;
};

ship.prototype.renderRemoteData = function(remoteData, offset){
	this.classicModel = this.direction === 1  ? this.rectsRight : this.rectsLeft;
	this.position = {x:parseInt(remoteData[offset + 1]), y: parseInt(remoteData[offset + 2])};
	this.mousePosition = {x:parseInt(remoteData[offset + 4]), y: parseInt(remoteData[offset + 5])};
	this.colorIndex = parseInt(remoteData[offset + 3]);
	this.color = this.colors[this.colorIndex];
	return offset + 6;
};



if(typeof(exports) !== 'undefined'){
	exports.ship = ship;
}
