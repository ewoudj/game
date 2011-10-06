if(typeof(require) !== 'undefined'){
	var helpers = require("./helpers").helpers;
	var entity = require("./entity").entity;
}

var explosion = function(config){
	helpers.apply(config, this);
	this.color = this.color || "#fff";
	this.position = this.position || {x:0, y:0};
	this.duration = 0;
	this.audioDone = false;
	this.rect = {x: -5, y: -5, w: 10, h: 10};
};

explosion.prototype = new entity();

explosion.prototype.render = function(){
	this.renderExplosion(this.duration, this.position, !this.audioDone);
	this.audioDone = true;
	/*if(!this.audioDone){
		this.audioDone = true;
		audio.explosionAudio.play();
	}
	if(this.duration%2){
		var currentPosition = { x: this.position.x - (4 * this.duration), y: this.position.y };
		for(var i = 0 ; i < 4 ; i++){
			var rectPos = helpers.rotate(currentPosition, this.position, i*90);
			this.engine.renderer.drawRect(helpers.ceilPoint(rectPos), this.rect, this.color, true);
		}
		this.engine.renderer.drawRect(this.position, this.rect, this.color, true);
	}*/
};

explosion.prototype.renderExplosion = function(duration, position, sound){
	if(sound){
		audio.explosionAudio.play();
	}
	if(duration%2){
		var currentPosition = { x: position.x - (4 * duration), y: position.y };
		for(var i = 0 ; i < 4 ; i++){
			var rectPos = helpers.rotate(currentPosition, position, i*90);
			this.engine.renderer.drawRect(helpers.ceilPoint(rectPos), this.rect, this.color, true);
		}
		this.engine.renderer.drawRect(position, this.rect, this.color, true);
	}
};

explosion.prototype.update = function(time){
	this.duration++;
	if(this.duration > 10){
		this.finished = true;
	} 
};

explosion.prototype.getRemoteData = function(){
	/*var result =  [
        4 , // type index (4 is explosion)
        Math.ceil(this.position.x) ,
        Math.ceil(this.position.y) ,
        this.duration,
        this.audioDone
    ];*/
	var result = "4," + Math.ceil(this.position.x) + "," +
		Math.ceil(this.position.y) + "," + this.duration  + "," + 
		(this.audioDone ? "1" : "0");
	this.audioDone = true;
	return result;
};

explosion.prototype.renderRemoteData = function(remoteData, offset){
	this.renderExplosion(
			parseFloat(remoteData[offset + 3]), 
			{x:parseFloat(remoteData[offset + 1]), y:parseFloat(remoteData[offset + 2])}, 
			!(!!(parseFloat(remoteData[offset + 4]))));
	return offset + 5;
};

if(typeof(exports) !== 'undefined'){
	exports.explosion = explosion;
}