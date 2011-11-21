/*
 *   User ufo
 */
if(typeof(require) !== 'undefined'){
	var helpers = require("./helpers").helpers;
	var entity = require("./entity").entity;
	var colors; // = require("./rules").colors;
	var laserbeam = require("./laserbeam").laserbeam;
	var explosion = require("./explosion").explosion;
	// AI
	var engine = require("./engine").engine;
	require('./ai/ufo.js');
}

var ufo = function(config){
	helpers.apply(config, this);
	this.laserState = 10; // 10 = ready, 0 = charging
	this.direction = this.direction || 1;
	this.audioDone = false;
	this.colors = colors ? colors : require("./rules").colors;
	this.color = this.colors[this.colorIndex] || this.color || "#FFF";
	this.speed = 3;
	this.invulerability = 20;
	this.nextFrame = false;
	this.name = this.name || 'ufo';
	this.position = this.position || {x:0, y:0};
	this.gunOffset =  {x:40, y:0};
	// x -20   y -15
	this.collisionRect = {x: -20, y: -15, w: 40,h: 30};
	this.modelIndex = 4;
	this.ufoFrame = 0;
	this.ufoFrames = [ [
		{x: -10, y: -15, w: 20, h: 10},
		{x: -10, y: -5, w: 30, h: 10},
		{x: -10, y: 5, w: 20, h: 10}
	],
	[
		{x: -10, y: -15, w: 20, h: 10},
		{x: -20, y: -5, w: 10, h: 10}, {x: 0, y: -5, w: 20, h: 10},
		{x: -10, y: 5, w: 20, h: 10}
	],
	[
		{x: -10, y: -15, w: 20, h: 10},
		{x: -20, y: -5, w: 20, h: 10}, {x: 10, y: -5, w: 10, h: 10},
		{x: -10, y: 5, w: 20, h: 10}
	],
	[
		{x: -10, y: -15, w: 20, h: 10},
		{x: -20, y: -5, w: 30, h: 10},
		{x: -10, y: 5, w: 20, h: 10}
	],
	[
		{x: -10, y: -15, w: 20, h: 10},
		{x: -20, y: -5, w: 40, h: 10},
		{x: -10, y: 5, w: 20, h: 10}
	]];
};

ufo.prototype = new entity();

ufo.prototype.render = function(){
	if(!this.audioDone){
		this.audioDone = true;
		try{
		if(audio){
			audio.appearAudio.play();
		}}catch(ex){}
	}
};

ufo.prototype.update = function(time){
	if(this.engine.mode !== 'client'){
		this.handleCollisions();
		var controls = engine.ai[engine.ufoai].call(this);
		this.mousePosition = controls.mousePosition;
		this.shoot = controls.shoot;
	}
	var timeDelta = this.getTimeDelta();
	this.position = this.calculateMovement(this.position, this.mousePosition, 10, timeDelta);
	if(this.engine.mode !== 'client'){
		this.handleLaser(time);
	}
	this.handleAnimation(time);
};

ufo.prototype.getTimeDelta = function(){
	if(!this.lastTimeCalled){
		this.lastTimeCalled = time;
	}
	var timeDelta = time - this.lastTimeCalled;
	this.lastTimeCalled = time;
	return timeDelta;
};

ufo.prototype.calculateMovement = function(currentPosition, mousePosition, speedLimit, timeDelta){
	var result = currentPosition;
	if(mousePosition){
		var deltaX = mousePosition.x - currentPosition.x;
		var deltaY = mousePosition.y - currentPosition.y;
		var distance = helpers.distance(currentPosition, mousePosition);
		var f = 0.25;
		var speed = speedLimit * (timeDelta / 40);
		if(distance > 5){
			f = 5 / distance;
		}
		result = {
			x: this.position.x + (deltaX * f),
			y: this.position.y + (deltaY * f)
		};
	}
	return result;
};

ufo.prototype.handleCollisions = function(){
	if(this.invulerability){
		this.invulerability--;
	}
	if(this.collisions && this.collisions.length){
		for(var i = 0; i < this.collisions.length; i++){
			if(this.collisions[i].owner != this && !this.invulerability){
				this.finished = true;
			}
		}
	}	
};

ufo.prototype.onRemove = function(){
	if(this.engine.mode !== 'server'){
		// The server does not care about the explosion as it is just a visual
		this.engine.add(new explosion({
			position: this.position
		}));
	}
};

ufo.prototype.handleLaser = function(time){
	if(this.shoot && this.laserState == 10){
		this.laserState = -20;
		this.gunOffset.x = this.direction === 1 ? 40 : -40;
		this.engine.add(new laserbeam({
									position: {x:this.position.x + this.gunOffset.x, y:this.position.y + this.gunOffset.y},
									direction: this.direction,
									owner: this
									}));
	}
	else if(this.laserState != 10){
		this.laserState = this.laserState + 2;
	}
};

ufo.prototype.handleAnimation = function(time){
	this.direction = 1;
	if(this.mousePosition && this.position.x < this.mousePosition.x){
		this.direction = -1;
	}
	if(!this.lastTimeFrameChanged){
		this.lastTimeFrameChanged = time;
	}
	var frameChangeTimeDelta = time - this.lastTimeFrameChanged;
	if(frameChangeTimeDelta > 80){
		this.lastTimeFrameChanged = time;
		this.classicModel = this.ufoFrames[this.ufoFrame];
		this.ufoFrame += this.direction;
		if(this.ufoFrame >= this.ufoFrames.length) this.ufoFrame = 0;
		if(this.ufoFrame < 0) this.ufoFrame = this.ufoFrames.length - 1;
	}
	if(this.ufoFrame === 0){
		this.modelIndex = 2;
		this.direction = 1;
	}
	else if(this.ufoFrame === 1){
		this.modelIndex = 3;
		this.direction = 1;
	}
	else if(this.ufoFrame === 2){
		this.modelIndex = 4;
		this.direction = 1;
	}
	else if(this.ufoFrame === 3){
		this.modelIndex = 4;
		this.direction = -1;
	}
	else if(this.ufoFrame === 4){
		this.modelIndex = 3;
		this.direction = -1;
	}
};

ufo.prototype.getRemoteData = function(){
	if(this.mousePosition){
		var mouseX = Math.ceil(this.mousePosition.x);
		var mouseY = Math.ceil(this.mousePosition.y);
		if(!this.previousMousePosition || mouseX !== this.previousMousePosition.x || mouseY !== this.previousMousePosition.y){
			this.previousMousePosition = {
				x: mouseX,
				y: mouseY
			};
			var result = "3," + Math.ceil(this.position.x) + "," +
			              Math.ceil(this.position.y) + "," +
			              this.colorIndex + "," + 
		        		  mouseX + "," +
			              mouseY;
		}
	}
	return result;
};

ufo.prototype.renderRemoteData = function(remoteData, offset){
	this.position = {x:parseFloat(remoteData[offset + 1]), y:parseFloat(remoteData[offset + 2])};
	this.colorIndex = parseInt(remoteData[offset + 3]);
	this.color = this.colors[this.colorIndex];
	this.mousePosition = {x:parseInt(remoteData[offset + 4]), y: parseInt(remoteData[offset + 5])};
	return offset + 6;
};

if(typeof(exports) !== 'undefined'){
	exports.ufo = ufo;
}