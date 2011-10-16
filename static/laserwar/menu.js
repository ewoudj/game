if(typeof(require) !== 'undefined'){
	var helpers = require("./helpers").helpers;
}

var menu = function(config){
	helpers.apply(config, this);
};
menu.prototype = new entity();

menu.prototype.update = function(time){

};

menu.prototype.render = function(time){
	this.engine.renderer.context.font = "50px CBM64";
	this.engine.renderer.context.fillStyle = "#FFF";
	this.engine.renderer.context.fillText("1 Single Player", 230, Math.ceil(this.engine.height / 2) - 60);
	this.engine.renderer.context.fillText("2 Multi Player", 230, Math.ceil(this.engine.height / 2) + 10);
};
