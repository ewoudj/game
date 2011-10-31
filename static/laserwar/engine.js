/*
 *   Engine
 */
if(typeof(require) !== 'undefined'){
	var helpers = require("./helpers").helpers;
}

var engine = function(config){
	helpers.apply({
		debug : false,
		width : 800,
		height : 600,
		pageColor : '#555',
		canvasColor : '#000',
		crosshair : true
	}, this);
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
	this.previousControllerMessageTime = 0;
	if(this.rulesType){
		this.add(new this.rulesType({engine: this}));
	}
	
	if(this.mode === 'server'){
		setInterval(this.update.bind(this), 20);
	}
	else{
		var self = this;
		this.socket.on('game state', function(msg){
			self.remoteDataString = msg;
		}); 
	}
	
	if(this.mode == 'standalone' || this.mode === 'client'){
		this.animate();
	}
};

engine.prototype.animate = function(){
	requestAnimationFrame(this.animate.bind(this));
	this.update();
	// Check to see if the renderer changed, 
	// if so, suspend the previous renderer (if it exists at all) 
	if(engine.previousRenderer && engine.previousRenderer !== engine.configuredRendering){
		engine.rendering[engine.previousRenderer].call(this, true);
	}
	engine.rendering[engine.configuredRendering].call(this);
	engine.previousRenderer = engine.configuredRendering;
};

engine.prototype.add = function(entity){
	this.entities.push(entity);
	entity.engine = this;
};

engine.prototype.update = function(time){
	time = time || new Date().getTime();
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
		if(this.socket){
			// Send controller state to the server
			// Send the message at most 20 times per second
			if((time - this.previousControllerMessageTime) >= 50) {
				this.previousControllerMessageTime = time;
				this.controllerMessage =  this.mousePosition.x + ',' + this.mousePosition.y + ',' + (this.buttonDown ? 1 : 0);
				// If the controls have not changed, do not send a message
				if(this.controllerMessage !== this.previousControllerMessage){
					this.previousControllerMessage = this.controllerMessage;
					this.socket.emit('controller state',this.controllerMessage);
				}
			}
		}
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
		// Send game state to the clients
		if(this.player1){
			this.player1.emit('game state', remoteData);
		}
		if(this.player2){
			this.player2.emit('game state', remoteData);
		}
	}
};

// Static configuration options
engine.ai = {};
engine.player1ai = 'heuristic';
engine.player2ai = 'heuristic';
engine.rendering = {};
engine.configuredRendering = 'classic';
engine.effectsVolume = 100;
engine.musicVolume = 100;

if(typeof(exports) !== 'undefined'){
	exports.engine = engine;
}


