if(typeof(require) !== 'undefined'){
	var helpers = require("./helpers").helpers;
	var entity = require("./entity").entity;
}

var explosion = function(config){
	helpers.apply(config, this);
	this.color = this.color || "#FFF";
	this.position = this.position || {x:0, y:0};
	this.duration = 0;
	this.modelIndex = 6;
	this.subEntities = [];
	for(var i = 0 ; i < 4 ; i++){
		this.subEntities.push({
			modelIndex: 6,
			color: this.color,
			position: this.position,
			direction: 0
		});
	}
	this.audioDone = false;
	this.rect = {x: -5, y: -5, w: 10, h: 10};
};

explosion.prototype = new entity();

explosion.prototype.render = function(){
	this.renderExplosion(this.duration, !this.audioDone);
	this.audioDone = true;
};

explosion.prototype.renderExplosion = function(duration, sound){
	if(sound){
		audio.explosionAudio.play();
	}
	if(duration%2){
		var currentPosition = { x: 0 - (4 * duration), y: 0 };
		this.classicModel = [];
		for(var i = 0 ; i < 4 ; i++){
			var rectPos = helpers.rotate(currentPosition, {x:0, y:0}, i*90);
			this.classicModel.push({x: -5 + rectPos.x, y: -5 + rectPos.y, w: 10, h: 10});
			this.subEntities[i].position = {x: this.position.x + rectPos.x, y: this.position.y + rectPos.y};
		}
		this.classicModel.push(this.rect);
	}
};

explosion.prototype.update = function(time){
	this.duration++;
	if(this.duration > 10){
		this.finished = true;
		for(var i = 0 ; i < 4 ; i++){
			this.subEntities[i].finished = true;
		}
	} 
};

explosion.prototype.getRemoteData = function(){
	var result = null;
	if(!this.remoteDataSend){
		result = "4," + Math.ceil(this.position.x) + "," +
			Math.ceil(this.position.y) + "," + this.duration  + "," + 
			(this.audioDone ? "1" : "0") + "," +
	        (this.finished ? "1" :  "0");
		this.audioDone = true;
		this.remoteDataSend = true;
	}
	return result;
};

explosion.prototype.renderRemoteData = function(remoteData, offset){
	this.classicModel = remoteData[offset + 3] === "1"  ? this.rectsRight : this.rectsLeft;
	this.position = {x:parseFloat(remoteData[offset + 1]), y:parseFloat(remoteData[offset + 2])};
	this.renderExplosion(
			parseFloat(remoteData[offset + 3]),
			(remoteData[offset + 5] === "4"));
	this.finished = (remoteData[offset + 5] === "1");
	return offset + 6;
};

if(typeof(exports) !== 'undefined'){
	exports.explosion = explosion;
}