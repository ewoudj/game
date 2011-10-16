/**
 * Crosshair
 */
if(typeof(require) !== 'undefined'){
	var helpers = require("./helpers").helpers;
}

var crosshair = function(config){
	helpers.apply(config, this);
	this.name = 'crosshair';	
	this.color = colors[this.colorIndex] || this.color || "#FFF";
	this.position = this.position || {x:0, y:0};
	this.rects = [
		{x: -10, y: -1, w: 20, h: 2},
		{x: -1, y: -10, w: 2, h: 20}
	];
};

crosshair.prototype = new entity();

crosshair.prototype.render = function(){
	if(this.engine.gameState.player1Ship && this.engine.gameState.player1Ship.finished){
		this.position = this.mousePosition;
		this.classicModel = this.rects;
	}
};

crosshair.prototype.update = function(time){
	
};