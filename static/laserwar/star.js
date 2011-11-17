/*
 *   Star
 */
if(typeof(require) !== 'undefined'){
	var helpers = require("./helpers").helpers;
	var entity = require("./entity").entity;
	var colors;
}

var star = function(config){
	helpers.apply(config, this);
	this.type = 'star';
	this.colors = colors ? colors : require("./rules").colors;
	this.color = this.colors[this.colorIndex] || this.color || "#FFF";
	this.previousColor = this.color;
	this.position = this.position || {x:0, y:0};
	this.angle = this.angle || 0;
	this.collisionRect = {x: -15, y: -15, w: 30,h: 30};
	this.modelIndex = 1;
	this.bottomOffset = 30;
	this.rects = [
		{x: -10, y: -20, w: 20, h: 10},
		{x: -20, y: -10, w: 40, h: 10},
		{x: -20, y: 0, w: 40, h: 10},
		{x: -10, y: 10, w: 20, h: 10}
	];
};

star.prototype = new entity();

star.prototype.render = function(){
	if(this.makeSound){
		audio.changeColorAudio.play();
		this.makeSound = false;
	}
	this.classicModel = this.rects;
};

star.prototype.update = function(time){
	if(this.engine.mode !== 'client'){
		if(!this.initialized){
			if(!this.parent){
				for(var i = 0; i < 4; i++){
						this.engine.add( new star({
						name        	: this.name + '.' + i,
						type        	: 'star',
						starId			: this.starId + (i + 1),
						colorIndex  	: this.colorIndex,
						direction   	: -1,
						position    	: { x: this.position.x - 110, y: this.position.y },
						angle			: 90 * i,
						parent			: this,
						bottomOffset	: this.bottomOffset
					}) );
				}
			}
			this.initialized = true;
		}
		if(this.collisions && this.collisions.length){
			for(var i = 0; i < this.collisions.length; i++){
				if(this.collisions[0].name == 'laserbeam'){
					this.colorIndex++;
					if(this.colorIndex == this.colors.length){
						this.colorIndex = 0;
					}
					this.color = this.colors[this.colorIndex];
					this.makeSound = true;
				}
			}
		}
	}
	if(!this.parentCenter){
		this.parentCenter = { 
			x: this.engine.width / 2, 
			y: (this.engine.height / 2) - this.bottomOffset
		};
		this.parentOriginalPosition = { 
			x: this.engine.width / 2, 
			y : (this.engine.height * 0.25) - this.bottomOffset
		};
	}
	
	// 0 is center star 1; 1, 2, 3, 4 are its sub-stars
	// 5 is center star 2; 6, 7, 8, 9 are its sub-stars
	if(this.starId === 0 || this.starId === 5){
		this.position = this.calculateParentPosition(this.starId, time);
	}
	else{
		this.position = this.calculateSubPosition(this.starId, time);
	}
};

star.parentSpeed = 0.3;
star.subSpeed = 0.5;

star.prototype.calculateParentPosition = function(starId, time){
	var angle = -(star.parentSpeed * (time / 40));
	if(starId === 5){angle += 180;}	
	return helpers.rotate(this.parentOriginalPosition, this.parentCenter, angle);
};

star.prototype.calculateSubPosition = function(starId, time){
	var angle = -(star.subSpeed * (time / 40));
	angle += (90 * ((starId % 5) - 1));
	var center = this.calculateParentPosition(starId < 5 ? 0 : 5, time);
	var originalPosition = { x: center.x - 100, y: center.y };	
	return helpers.rotate(originalPosition, center, angle);
};

star.prototype.getRemoteData = function(){
	var result = null;
	if(!this.remoteDataSend || this.color !== this.previousColor){
		result = "2," + this.colorIndex + "," +
	        (this.makeSound ? "1" : "0") + "," +
	        this.starId;
		this.makeSound = false;
		this.remoteDataSend = true;
		this.previousColor = this.color;
	}
	return result;
};

star.prototype.renderRemoteData = function(remoteData, offset){
	if(!!parseFloat(remoteData[offset + 2])){
		audio.changeColorAudio.play();		
	}
	this.classicModel = this.rects;
	this.colorIndex = parseInt(remoteData[offset + 1]);
	this.color = this.colors[this.colorIndex];
	this.starId = parseInt(remoteData[offset + 3]);
	return offset + 4;
};

if(typeof(exports) !== 'undefined'){
	exports.star = star;
}