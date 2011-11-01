/*
 *   Laser beam
 */
if(typeof(require) !== 'undefined'){
	var helpers = require("./helpers").helpers;
	var entity = require("./entity").entity;
}

var laserbeam = function(config){
	helpers.apply(config, this);
	this.name = 'laserbeam';	
	this.direction = this.direction || 1;
	this.color = "#FFF";
	this.position = this.position || {x:0, y:0};
	this.modelIndex = 5;
	this.rects = [
		{x: -20, y: -5, w: 40, h: 10}
	];
	this.collisionRect = this.rects[0];
	this.audioDone = false;
};

laserbeam.prototype = new entity();

laserbeam.prototype.render = function(){
	this.classicModel = this.rects;
	if(!this.audioDone){
		this.audioDone = true;
		audio.laserAudio.play();
	}
};

laserbeam.prototype.update = function(time){
	this.finished = (this.position.x < -40 || this.position.x > this.engine.width + 20);
	if(this.collisions && this.collisions.length){
		for(var i = 0; i < this.collisions.length; i++){
			if(this.collisions[i] != this.owner){
				this.finished = true;
				return;
			}
		}
	}
	if(!this.lastTimeCalled){
		this.lastTimeCalled = time;
	}
	var timeDelta = time - this.lastTimeCalled;
	this.lastTimeCalled = time;
	var previousPosition = this.position;
	this.position.x = this.position.x + ((40 * this.direction)  * (timeDelta / 40));
};

laserbeam.prototype.getRemoteData = function(){
	var result = "1," + Math.ceil(this.position.x) + "," +
	              Math.ceil(this.position.y) + "," + 
	              (this.audioDone ? "1" : "0") + "," +
	              (this.finished ? "1" :  "0");
	this.audioDone = true;
	return result;
};

laserbeam.prototype.renderRemoteData = function(remoteData, offset){
	this.classicModel = this.rects;
	this.position = {x:parseFloat(remoteData[offset + 1]), y:parseFloat(remoteData[offset + 2])};
	this.color = '#FFF';
	if(remoteData[offset + 3] === "0"){
		audio.laserAudio.play();
	}
	this.finished = (remoteData[offset + 4] === "1");
	return offset + 5;
};

if(typeof(exports) !== 'undefined'){
	exports.laserbeam = laserbeam;
}