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
	this.color = "#fff";
	this.position = this.position || {x:0, y:0};
	this.rects = [
		{x: -20, y: -5, w: 40, h: 10}
	];
	this.collisionRect = this.rects[0];
	this.audioDone = false;
};

laserbeam.prototype = new entity();

laserbeam.prototype.render = function(){
	this.engine.renderer.drawRects(helpers.ceilPoint(this.position), this.rects, this.color, true);
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
	var previousPosition = this.position;
	this.position.x = this.position.x + (40 * this.direction);
};

laserbeam.prototype.getRemoteData = function(){
	/*var result = [
        1 , // type index (1 is laserbeam)
        Math.ceil(this.position.x) ,
        Math.ceil(this.position.y) ,
        this.audioDone
    ];*/
	var result = "1," + Math.ceil(this.position.x) + "," +
	              Math.ceil(this.position.y) + "," + 
	              (this.audioDone ? "1" : "0");
	this.audioDone = true;
	return result;
};

laserbeam.prototype.renderRemoteData = function(remoteData, offset){
	this.engine.renderer.drawRects(
			{x:parseFloat(remoteData[offset + 1]), y:parseFloat(remoteData[offset + 2])}, 
			this.rects, 
			'#fff', 
			true
	);
	if(!(!!(parseFloat(remoteData[offset + 3])))){
		audio.laserAudio.play();
	}
	return offset + 4;
};

if(typeof(exports) !== 'undefined'){
	exports.laserbeam = laserbeam;
}