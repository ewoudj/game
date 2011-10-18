/*
 *   Star
 */
if(typeof(require) !== 'undefined'){
	var helpers = require("./helpers").helpers;
	var entity = require("./entity").entity;
	var colors; // = require("./rules").colors;
}

var star = function(config){
	helpers.apply(config, this);
	this.type = 'star';
	this.colors = colors ? colors : require("./rules").colors;
	this.color = this.colors[this.colorIndex] || this.color || "#FFF";
	this.position = this.position || {x:0, y:0};
	this.originalPosition = this.position;
	this.angle = this.angle || 0;
	this.collisionRect = {x: -15, y: -15, w: 30,h: 30};
	this.modelIndex = 1;
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
	if(!this.initialized){
		if(!this.parent){
			for(var i = 0; i < 4; i++){
					this.engine.add( new star({
					name        	: this.name + '.' + i,
					type        	: 'star',
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
	this.angle -= (this.parent ? 0.5 : 0.3);
	var center = this.parent ? this.parent.position : { x: this.engine.width / 2, y: (this.engine.height / 2) - this.bottomOffset };
	if(this.parent){
		this.originalPosition = { x: center.x - 100, y: center.y };
	}
	this.position = helpers.rotate(this.originalPosition, center, this.angle);
};

star.prototype.getRemoteData = function(){
//	var result = [
//        2 , // type index (2 is star)
//        Math.ceil(this.position.x) ,
//        Math.ceil(this.position.y) ,
//        this.color,
//        this.makeSound
//    ];
	var result = "2," + Math.ceil(this.position.x) + "," +
	              Math.ceil(this.position.y) + "," +
	              this.color + "," +
	              (this.makeSound ? "1" : "0");
	this.makeSound = false;
	return result;
};

star.prototype.renderRemoteData = function(remoteData, offset){
	if(!!parseFloat(remoteData[offset + 4])){
		audio.changeColorAudio.play();		
	}
	this.classicModel = this.rects;
	this.position = {x:parseFloat(remoteData[offset + 1]), y:parseFloat(remoteData[offset + 2])};
	this.color = remoteData[offset + 3];
	return offset + 5;
};

if(typeof(exports) !== 'undefined'){
	exports.star = star;
}