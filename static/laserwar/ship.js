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
	this.laserState = 10; // 10 = ready, 0 = charging
	this.direction = this.direction || 1;
	this.colors = colors ? colors : require("./rules").colors;
	this.color = this.colors[this.colorIndex] || this.color || "#FFF";
	this.speed = 3;
	this.colorLoop = 0;
	this.invulerability = 1000;
	this.audioDone = false;
	this.name = this.name || 'ship';
	this.position = this.position || {x:0, y:0};
	this.gunOffset =  {x:0, y: 0};
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

ship.prototype.update = function(time){
	if(this.engine.mode == 'client'){return;}
	if(!this.lastTimeCalled){
		this.lastTimeCalled = time;
	}
	var timeDelta = time - this.lastTimeCalled;
	this.lastTimeCalled = time;
	if(this.invulerability){
		this.invulerability -= timeDelta;
		if(this.invulerability < 0){
			this.invulerability = 0;
		}
	}
	var maxScore = this.engine.playerCount === 0 ? engine.maxAiScore : engine.maxScore;
	if(this.engine.gameState.player1Score === maxScore || this.engine.gameState.player2Score === maxScore){
		this.engine.canvasColor = this.colors[this.colorLoop];
		this.colorLoop++;
		if(!(this.colorLoop < this.colors.length)){
			this.colorLoop = 0;
		}
	}
	else if(this.collisions && this.collisions.length){
		for(var i = 0; i < this.collisions.length; i++){
			if(this.collisions[i].owner != this && !(this.invulerability && this.collisions[i] == this.spawnStar)){
				if(!this.finished && this.collisions[i].owner == this.engine.gameState.player1Ship && this == this.engine.gameState.player2Ship){
					this.engine.gameState.player1Score++;
				}
				if(!this.finished && this.collisions[i].owner == this.engine.gameState.player2Ship && this == this.engine.gameState.player1Ship){
					this.engine.gameState.player2Score++;
				}
				this.finished = true;
				this.engine.add(new explosion({
					position: this.position
				}));
			}
		}
	}
	var previousPosition = this.position;
	this.shoot = false;
	if(this.type != 'computer'){
		if(this.engine.mode == 'standalone' || (this.name == "Player 1" && this.engine.player1)){
			this.shoot = this.engine.buttonDown;
			this.position = this.calculateMovement(this.position, this.engine.mousePosition, 10, timeDelta);
		}
		else if(this.name == "Player 2" && this.engine.player2){
			this.shoot = this.engine.buttonDown2;
			this.position = {
					x: this.engine.mousePosition2.x, 
					y: this.engine.mousePosition2.y
			};
		}
	}
	else if(this.type == 'computer'){
		var controls;
		if(this.name === 'Player 1'){
			controls = engine.ai[engine.player1ai].call(this);
		}
		else {
			controls = engine.ai[engine.player2ai].call(this);
		}
		this.position = this.calculateMovement(this.position, controls.mousePosition, 10, timeDelta);
		this.shoot = controls.shoot;
	}
	if(this.shoot && this.laserState == 300){
		this.laserState = 0;	
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
	if(this.position.x > previousPosition.x){
		this.direction = 1;
	}
	else if(this.position.x < previousPosition.x){
		this.direction = -1;
	}
	this.classicModel = this.direction === 1 ? this.rectsRight : this.rectsLeft;
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
	//var r = distance / speedLimit;
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
	var result = "0," + Math.ceil(this.position.x) + "," +
	              Math.ceil(this.position.y) + "," +
	              this.direction + "," +
	              this.color + "," +
	              (this.audioDone ? "1" :  "0");
	this.audioDone = true;
	return result;
};

ship.prototype.getRemoteData = function(){
	var result = "0," + Math.ceil(this.position.x) + "," +
	              Math.ceil(this.position.y) + "," +
	              this.direction + "," +
	              this.color + "," +
	              (this.audioDone ? "1" : "0") + "," +
	              (this.finished ? "1" :  "0");
	this.audioDone = true;
	return result;
};

ship.prototype.renderRemoteData = function(remoteData, offset){
	if(remoteData[offset + 5] === "0"){
		audio.appearAudio.play();
	}
	this.direction = parseInt(remoteData[offset + 3]);
	this.classicModel = this.direction === 1  ? this.rectsRight : this.rectsLeft;
	this.position = {x:parseInt(remoteData[offset + 1]), y: parseInt(remoteData[offset + 2])};
	this.color = remoteData[offset + 4];
	this.finished = (remoteData[offset + 6] === "1");
	return offset + 7;
};



if(typeof(exports) !== 'undefined'){
	exports.ship = ship;
}
