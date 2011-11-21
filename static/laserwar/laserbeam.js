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
	this.classicModel = this.rects;
	this.collisionRect = this.rects[0];
	this.audioDone = false;
};

laserbeam.prototype = new entity();

laserbeam.prototype.render = function(){
	if(audio && !this.audioDone){
		this.audioDone = true;
		audio.laserAudio.play();
	}
};

laserbeam.prototype.update = function(time){
	if(this.engine.mode !== 'client'){
		this.finished = (this.position.x < -40 || this.position.x > this.engine.width + 20);
		if(this.collisions && this.collisions.length){
			for(var i = 0; i < this.collisions.length; i++){
				if(this.collisions[i] != this.owner){
					this.finished = true;
					return;
				}
			}
		}
	}
	if(!this.startTime){
		this.startTime = time;
		this.startPosition = this.position;
	}
	this.position.x = this.startPosition.x + ((this.direction * (time - this.startTime)) / 6);
};

laserbeam.prototype.getRemoteData = function(){
	var result = null;
	if(!this.remoteDataSend && !this.finished){
		result = "1," + Math.ceil(this.position.x) + "," +
	              Math.ceil(this.position.y) + "," + 
	              this.direction;
		this.audioDone = true;
		this.remoteDataSend = true;
	}
	return result;
};

laserbeam.prototype.renderRemoteData = function(remoteData, offset){
	this.position = {x:parseInt(remoteData[offset + 1]), y:parseInt(remoteData[offset + 2])};
	this.direction = parseInt(remoteData[offset + 3]);
	return offset + 4;
};

if(typeof(exports) !== 'undefined'){
	exports.laserbeam = laserbeam;
}