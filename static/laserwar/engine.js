/*
 *   Engine
 */
if(typeof(require) !== 'undefined'){
	var helpers = require("./helpers").helpers;
}

var engine = function(config){
	helpers.apply(config, this);
	if(this.mode == 'standalone' || this.mode == 'client'){
		// Disable selection of text/elements in the browser
		document.onselectstart = function() {return false;};
		document.body.style.background = this.pageColor;
	}
	this.buttonDown = false;
	this.mousePosition = {x: 0, y: 0};
	this.buttonDown2 = false;
	this.mousePosition2 = {x: 0, y: 0};
	this.remoteRenderer = [];
	this.entities = [];
	this.remoteData = [];
	if(this.rulesType){
		this.add(new this.rulesType({engine: this}));
	}
	
	if(this.mode === 'server'){
		setInterval(this.update.bind(this), 20);
	}
	
//	if(this.mode === 'client'){
//		setInterval(function(){
//			this.update();
//			engine.rendering[engine.configuredRendering].call(this);
//		}.bind(this), 38);
//	}
	
	if(this.mode == 'standalone' || this.mode === 'client'){
		this.animate();
	}
};

engine.prototype.animate = function(){
	requestAnimationFrame(this.animate.bind(this));
	this.update();
	engine.rendering[engine.configuredRendering].call(this);
};

engine.prototype.add = function(entity){
	this.entities.push(entity);
	entity.engine = this;
};

engine.prototype.update = function(time){
	if(this.mode == 'standalone' || this.mode == 'server'){
		var newList = [];
		// Calculate collisions
		for(var i = 0, l = this.entities.length; i < l; i++){
			var e1 = this.entities[i];
			e1.collisions = [];
			for(var j = 0; j < l; j++){
				var e2 = this.entities[j];
				if(e1 != e2 && e1.collidesWith(e2)){
					e1.collisions.push(e2);
					if(!e2.collisions){
						e2.collisions = [];
					}
					e2.collisions.push(e1);
				}
			}
		}
		// Update
		var time = new Date().getTime();
		for(var i = 0, l = this.entities.length; i < l; i++){
			var e1 = this.entities[i];
			if(e1 && e1.update){
				e1.update(time);
			}
		}
		// Filter out the objects that indicate they are finished
		for(var i = 0, l = this.entities.length; i < l; i++){
			var e1 = this.entities[i];
			if(e1 && !e1.finished){
				newList.push(e1);
			}
		}
		this.entities = newList;
	}
	else if(this.mode == "client"){
		send('::r1,' + this.mousePosition.x + ',' + this.mousePosition.y + ',' + (this.buttonDown ? 1 : 0));
	}
	if(this.mode == 'server'){
		var remoteData = ""; //[];
		for(var i = 0, l = this.entities.length; i < l; i++){
			var e = this.entities[i];
			if(e.getRemoteData){
				if(remoteData != ""){
					remoteData = remoteData + ",";
				}
				remoteData = remoteData + e.getRemoteData();
			}
		}
		this.channel.appendMessage('game','msg', '::' + remoteData);
	}
};

engine.ai = {};
engine.player1ai = 'heuristic';
engine.player2ai = 'heuristic';
engine.rendering = {};
engine.configuredRendering = 'classic';

if(typeof(exports) !== 'undefined'){
	exports.engine = engine;
}


