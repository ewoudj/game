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
		// Initialize the settings UI
		engine.settings.initialize();
	}
	this.buttonDown = false;
	this.mousePosition = {x: 0, y: 0};
	this.buttonDown2 = false;
	this.mousePosition2 = {x: 0, y: 0};
	this.remoteRenderer = [];
	this.entities = [];
	this.remoteData = [];
	this.previousControllerMessageTime = 0;
	this.remoteDataString = [];
	if(this.rulesType){
		this.add(new this.rulesType({engine: this}));
	}
	
	if(this.mode === 'server'){
		this.serverUpdateLoop();
	}
	else{
		var self = this;
		this.socket.on('game state', function(msg){
			self.remoteDataString.push(msg);
		}); 
	}
	
	if(this.mode == 'standalone' || this.mode === 'client'){
		this.animate();
	}
};

engine.prototype.serverUpdateLoop = function(){
	setTimeout( this.serverUpdateLoop.bind(this), 1000 / 60 );
	this.update();
};

engine.prototype.animate = function(){
	requestAnimationFrame(this.animate.bind(this));
	this.update();
	// Check to see if the renderer changed, 
	// if so, suspend the previous renderer (if it exists at all) 
	if(engine.previousRenderer && engine.previousRenderer !== engine.renderer){
		engine.rendering[engine.previousRenderer].call(this, true);
	}
	engine.rendering[engine.renderer].call(this);
	engine.previousRenderer = engine.renderer;
};

engine.prototype.add = function(entity){
	if(this.entities.length === 0){
		this.entityIdCounter = 0;
	}
	if(!entity.engineId){
		entity.engineId = this.entityIdCounter;
		this.entityIdCounter++;
	}
	this.entities.push(entity);
	entity.engine = this;
};

engine.prototype.calculateCollisions = function(){
	for(var i = 0, l = this.entities.length; i < l; i++){
		var e1 = this.entities[i];
		e1.collisions = [];
		for(var j = 0; j < l; j++){
			var e2 = this.entities[j];
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
};

engine.prototype.processRemoteData = function(){
	var s = this.remoteDataString.shift();
	while(s){
		var dataFromServer = s.split(",");
		var offset = 0;
		var l = dataFromServer.length;
		var i = 0;
		while(offset < l){
			var e = null;
			var engineId = parseInt(dataFromServer[offset]);
			offset++;
			for(var j = 0, m = this.entities.length; j < m; j++){
				if(engineId === this.entities[j].engineId){
					e = this.entities[j];
					break;
				}
			}
			if(e === null){
				// Add new entities
				var entityType = this.remoteRenderer[dataFromServer[offset]];
				e = new entityType({
					engine: this,
					engineId: engineId
				});
				this.add(e);
			}
			offset = e.renderRemoteData(dataFromServer,offset);
			i++;
		}
		s = this.remoteDataString.shift();
	}
};

engine.prototype.update = function(time){
	time = time || new Date().getTime();
	var remoteData = "";
	if(this.mode !== "client"){
		this.calculateCollisions();
	}
	else if(this.mode === "client"){
		this.processRemoteData();
	}
	// Update
	for(var i = 0, l = this.entities.length; i < l; i++){
		var e1 = this.entities[i];
		if(e1 && e1.update){
			// Run the entity update logic
			if(this.mode !== "client"){
				e1.update(time);
			}
			// If we are on the server we want to serialize the objects now
			// before finished entities get removed from the list.
			if(this.mode === "server"){
				if(e1.getRemoteData){
					if(remoteData != ""){
						remoteData = remoteData + ",";
					}
					remoteData =  remoteData + e1.engineId + "," + e1.getRemoteData();
				}
			}
		}
	}
	// Filter out the objects that indicate they are finished
	var newList = [];
	for(var i = 0, l = this.entities.length; i < l; i++){
		var e1 = this.entities[i];
		if(e1 && !e1.finished){
			newList.push(e1);
		}
	}
	this.entities = newList;
	if(this.mode === "client"){
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
		// Send game state to the clients
		if(this.player1){
			this.player1.emit('game state', remoteData);
		}
		if(this.player2){
			this.player2.emit('game state', remoteData);
		}
	}
};

//Stores a value in local storage. Will handle objects, will probably fail when called on the server.
engine.setItem = function(key, value) {
    if (typeof value == "object") {
        value = JSON.stringify(value);
    }
    localStorage.setItem(key, value);
};

// Gets an object from local storage, if no value for key was found defaultValue is returned;
engine.getItem = function(key, defaultValue) {
    var result = null;
    if(typeof localStorage != 'undefined'){
		result = localStorage.getItem(key);
	    // assume it is an object that has been stringified
	    if (result && result[0] == "{") {
	        result = JSON.parse(result);
	    }
    }
    return result || defaultValue;
};

// Static configuration options
engine.ai = {};
engine.player1ai = engine.getItem("player1ai", 'heuristic');
engine.player2ai = engine.getItem("player2ai", 'heuristic');
engine.rendering = {};
engine.renderer = engine.getItem("renderer",'classic');
engine.effectsVolume = parseInt(engine.getItem("effectsVolume", 25));
engine.musicVolume = parseInt(engine.getItem("musicVolume", 40));

if(typeof(exports) !== 'undefined'){
	exports.engine = engine;
}


