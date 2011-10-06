/*
 *   User ufo
 */
if(typeof(require) !== 'undefined'){
	var helpers = require("./helpers").helpers;
	var entity = require("./entity").entity;
	var colors; // = require("./rules").colors;
	var laserbeam = require("./laserbeam").laserbeam;
	var explosion = require("./explosion").explosion;
}

var ufo = function(config){
	helpers.apply(config, this);
	this.laserState = 10; // 10 = ready, 0 = charging
	this.direction = this.direction || 1;
	this.audioDone = false;
	this.colors = colors ? colors : require("./rules").colors;
	this.color = this.colors[this.colorIndex] || this.color || "#fff";
	this.speed = 3;
	this.invulerability = 20;
	this.nextFrame = false;
	this.name = this.name || 'ufo';
	this.position = this.position || {x:0, y:0};
	this.pointerOffset = {x:20, y:15};
	this.gunOffset =  {x:20, y:10};
	this.collisionRect = {x: 0, y: 0, w: 40,h: 30};
	this.ufoFrame = 0;
	this.ufoFrames = [ [
		{x: 10, y: 0, w: 20, h: 10},
		{x: 10, y: 10, w: 30, h: 10},
		{x: 10, y: 20, w: 20, h: 10}
	],
	[
		{x: 10, y: 0, w: 20, h: 10},
		{x: 0, y: 10, w: 10, h: 10}, {x: 20, y: 10, w: 20, h: 10},
		{x: 10, y: 20, w: 20, h: 10}
	],
	[
		{x: 10, y: 0, w: 20, h: 10},
		{x: 0, y: 10, w: 20, h: 10}, {x: 30, y: 10, w: 10, h: 10},
		{x: 10, y: 20, w: 20, h: 10}
	],
	[
		{x: 10, y: 0, w: 20, h: 10},
		{x: 0, y: 10, w: 30, h: 10},
		{x: 10, y: 20, w: 20, h: 10}
	],
	[
		{x: 10, y: 0, w: 20, h: 10},
		{x: 0, y: 10, w: 40, h: 10},
		{x: 10, y: 20, w: 20, h: 10}
	]];
};

ufo.prototype = new entity();

ufo.prototype.render = function(){
	this.engine.renderer.drawRects(helpers.ceilPoint(this.position), this.rects, this.color, true);
};

ufo.prototype.update = function(time){
	if(this.invulerability){
		this.invulerability--;
	}
	if(this.collisions && this.collisions.length){
		for(var i = 0; i < this.collisions.length; i++){
			if(this.collisions[i].owner != this && !this.invulerability){
				this.finished = true;
				this.engine.add(new explosion({
					position: this.position
				}));
			}
		}
	}
	var previousPosition = this.position;
	var shoot = false;

	// AI
	// Priority 1: staying alive
	// Avoid collisions
	var nearestEntityDistance = Infinity;
	var nearestEntity = null;
	var nearestStarDistance = Infinity;
	var nearestStar = null;
	var evading = false;
	// Determine the nearest object  
	for(var i = 0; i < this.engine.entities.length; i++){
		if(this.engine.entities[i] != this && this.engine.entities[i].owner != this && this.engine.entities[i].position){
			var d = helpers.distance(this.position, this.engine.entities[i].position);
			if(d < nearestEntityDistance){ 
				nearestEntityDistance = d;
				nearestEntity = this.engine.entities[i];
			}
			if(this.engine.entities[i].type == 'star' && this.engine.entities[i].colorIndex != this.colorIndex && d < nearestStarDistance){ 
				nearestStarDistance = d;
				nearestStar = this.engine.entities[i];
			}
		}
	}
	if(nearestEntity && nearestEntityDistance < 3){
		var deltax = nearestEntity.position.x - this.position.x;
		var deltay = nearestEntity.position.y - this.position.y;
		var targetVector = { 
		y: (deltay) < 0 ? 1 : -1,
		x: (deltax) < 0 ? 1 : -1
		};
		this.position = {
		x: this.position.x + ( targetVector.x * this.speed ) ,
		y: this.position.y + ( targetVector.y * this.speed )
		};
		evading = true;
	}
	// Priority 2: 
	// Select target
	var target = null;
	if(!target){
		target = nearestStar;
	}
	if(target){                    
		var deltax = target.position.x - this.position.x;
		var deltay = target.position.y - this.position.y;
		var targetVector = { 
		y: (deltay) < 0 ? -1 : 1,
		x: (deltax) < 0 ? -1 : 1
		};
		if(!evading){
			var movey = !(deltay < 10 && deltay > -10);
			var movex = !(deltax < 80 && deltax > -80);
			var reversex = (deltax < 60 && deltax > -60);
			this.position = {
			x: this.position.x + ( targetVector.x * (movex ? this.speed : (reversex ? -this.speed : 0 ) ) ),
			y: this.position.y + ( targetVector.y * (movey ? this.speed : 0) )
			};
		}
		if(this.position.x == previousPosition.x && this.direction != targetVector.x){
			this.direction = targetVector.x;
		}
		// Only shoot when
		// - the target is near (y)
		// - the ship is pointed in the right direction
		shoot = ((deltay < 40 && deltay > -40) && (this.direction == targetVector.x));
	}
	if(shoot && this.laserState == 10){
		this.laserState = -20;
		this.engine.add(new laserbeam({
									position: {x:this.position.x + this.gunOffset.x, y:this.position.y + this.gunOffset.y},
									direction: this.direction,
									owner: this
									}));
	}
	else if(this.laserState != 10){
		this.laserState = this.laserState + 2;
	}
	if(this.position.x > previousPosition.x){
		this.direction = 1;
	}
	else if(this.position.x < previousPosition.x){
		this.direction = -1;
	}
	this.rects = this.ufoFrames[this.ufoFrame];// this.direction == 1 ? this.ufo1 : this.ufo2;
	//if(this.nextFrame){
		this.ufoFrame += this.direction;
		if(this.ufoFrame >= this.ufoFrames.length) this.ufoFrame = 0;
		if(this.ufoFrame < 0) this.ufoFrame = this.ufoFrames.length - 1;
		//this.nextFrame = false;
	//}
	//else{
	//	this.nextFrame = true;
	//}
};

ufo.prototype.getRemoteData = function(){
//	return [
//        3 , // type index (0 is ship)
//        Math.ceil(this.position.x) ,
//        Math.ceil(this.position.y) ,
//        this.ufoFrame,
//        this.color
//    ];
	var result = "3," + Math.ceil(this.position.x) + "," +
			Math.ceil(this.position.y) + "," +
			this.ufoFrame + "," +
			this.color + "," +
            (this.audioDone ? "1" :  "0");
	this.audioDone = true;
	return result;
};

ufo.prototype.renderRemoteData = function(remoteData, offset){
	//if(!this.firstRender){
	//	this.firstRender = true;
	//	audio.appearAudio.play();
	//}
	if(!(!!(parseFloat(remoteData[offset + 5])))){
		audio.appearAudio.play();
	}
	this.engine.renderer.drawRects(
			{x:parseFloat(remoteData[offset + 1]), y:parseFloat(remoteData[offset + 2])}, 
			this.ufoFrames[parseFloat(remoteData[offset + 3])], 
			remoteData[offset + 4], 
			true
	);
	return offset + 6;
};

if(typeof(exports) !== 'undefined'){
	exports.ufo = ufo;
}