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
		crosshair : true,
		playerCount : 0
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
	this.entities = [];
	this.remoteData = [];
	this.previousControllerMessageTime = 0;
	this.previousGameStateMessageTime = 0;
	this.remoteDataString = [];
	this.finishedEntities = [];
    this.startTime = new Date().getTime();
	if(this.rulesType){
		this.rules = new this.rulesType({engine: this});
		this.add(this.rules);
	}
	if(this.mode === 'server'){
		this.serverUpdateLoop();
	}
	else{		
		// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
		if ( !window.requestAnimationFrame ) {
			window.requestAnimationFrame = ( function() {
				return window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
					window.setTimeout( callback, 1000 / 60 );
				};
			})();
		}
		this.initializeControllers();
		var self = this;
		if(this.socket){
			this.socket.on('game state', function(msg){
				self.remoteDataString.push(msg);
			});
			this.socket.on('reset', function(msg){
				self.reset();
			});
		}
		this.animate();
		document.body.oncontextmenu = function(){return false;};
	}
};

engine.prototype.initializeControllers = function(){
	this.controllers = [];
	this.touchController = new touchController({engine: this});
	this.controllers.push( this.touchController );
	this.mouseController = new mouseController({engine: this});
	this.controllers.push( this.mouseController );
};

engine.prototype.serverUpdateLoop = function(){
	setTimeout( this.serverUpdateLoop.bind(this), 1000 / 50 );
	this.update();
};

engine.prototype.animate = function(){
	requestAnimationFrame(this.animate.bind(this));
	this.update();
	// If the renderer is configured incorrectly fall back to classic
	if(!engine.rendering[engine.renderer]){
		engine.renderer = 'classic';
	}
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
	if(!entity.engineId && this.mode === 'server'){
		entity.engineId = this.entityIdCounter;
		this.entityIdCounter++;
	}
	this.entities.push(entity);
	entity.engine = this;
};

engine.prototype.contains = function(entity){
	var result = false;
	for(var i = 0, l = this.entities.length; i < l; i++){
		if(this.entities[i] === entity){
			result = true;
			break;
		}
	}
	return result;
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

engine.prototype.reset = function(menu){
	this.entities = menu ? [menu] : [];
	this.startTime = new Date().getTime();
	this.previousControllerMessageTime = 0;
	this.previousGameStateMessageTime = 0;
	this.remoteData = [];
	this.remoteDataString = [];
	this.add(this.rules);
	this.rules.initialized = false;
};

engine.prototype.update = function(){
	time = new Date().getTime() - this.startTime;
	if(this.mode !== "client"){
		this.calculateCollisions();
	}
	else if(this.mode === "client"){
		this.sendControllerStateToServer(time);
		this.processRemoteData();
	}
	// Update
	this.updateEntities(time);
};

engine.prototype.sendControllerStateToServer = function(time){
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
};

engine.prototype.updateEntities = function (time){
	for(var i = 0, l = this.entities.length; i < l; i++){
		var e = this.entities[i];
		if(e && e.update){
			e.update(time);
		}
	}
	this.removeFinishedEntities();
	this.sendGameStateToClient(time);
};

engine.prototype.removeFinishedEntities = function(){
	// Filter out the objects that indicate they are finished
	var oldEntityList = this.entities;
	this.entities = [];
	this.finishedEntities = this.finishedEntities || [];
	for(var i = 0, l = oldEntityList.length; i < l; i++){
		var e1 = oldEntityList[i];
		if(e1 && !e1.finished){
			 this.entities.push(e1);
		}
		else if(e1 && e1.finished){
			if(e1.onRemove){
				e1.onRemove();
			}
			if(this.mode === "server"){
				this.finishedEntities.push(e1);
			}
		}
	}
};

engine.prototype.sendGameStateToClient = function(time){
	var remoteData = this.prepareRemoteData(time);
	if(remoteData !== ''){
		if(this.player1){
			this.player1.emit('game state', remoteData);
		}
		if(this.player2){
			this.player2.emit('game state', remoteData);
		}
	}
};

engine.prototype.prepareRemoteData = function(time){
	var remoteData = '';
	if((this.mode === "server") && (((time - this.previousGameStateMessageTime) >= 50) || (this.previousGameStateMessageTime > time))){
		this.previousGameStateMessageTime = time;
		remoteData = this.appendRemoteData(this.entities, remoteData);
		remoteData = this.appendRemoteData(this.finishedEntities, remoteData);
		this.finishedEntities = [];
	}
	if(remoteData){
		remoteData = time + ',' + remoteData;
	}
	return remoteData;
};

engine.prototype.appendRemoteData = function(entities, remoteData){
	for(var i = 0, l = entities.length; i < l; i++){
		var e = entities[i];
		if(e && e.getRemoteData){
			if(e.finished){
				remoteData = remoteData ? remoteData + "," : "";
				remoteData =  remoteData + e.engineId + ",-1";
			}
			else{
				var newData = e.getRemoteData();
				if(newData){
					remoteData = remoteData ? remoteData + "," : "";
					remoteData =  remoteData + e.engineId + "," + newData;
				}
			}
		}
	}
	return remoteData;
};

engine.prototype.getEntityById = function(engineId){
	var result = null;
	for(var i = 0, m = this.entities.length; i < m; i++){
		if(engineId === this.entities[i].engineId){
			result = this.entities[i];
			break;
		}
	}
	return result;
};

engine.prototype.processRemoteData = function(){
	var s = this.remoteDataString.shift();
	while(s){
		var dataFromServer = s.split(",");
		var offset = 0;
		// First item in the array is always the server time for the data
		this.lastServerTimedate = dataFromServer[0];
		offset++;
		var l = dataFromServer.length;
		var i = 0;
		while(offset < l){
			var e = null;
			// For each entity, the first array item contains it's id  
			var engineId = parseInt(dataFromServer[offset]);
			offset++;
			e = this.getEntityById(engineId);
			// If the object was not found by Id it needs to be created
			if(e === null && dataFromServer[offset] !== "-1"){
				// The type of the entity is stored in the second array item
				var entityType = engine.remoteRenderer[dataFromServer[offset]];
				// Create a new instance and add it to the engine
				e = new entityType({
					engine: this,
					engineId: engineId
				});
				this.add(e);
			}
			else if(!e && dataFromServer[offset] === "-1"){
				// If the type of the entity is -1 that means the object was finished.
				// In this case the object was finished but apparently never reached the
				// client in the first place (lived extremely shortly on the server). 
				// The offset needs to be increased anyway.
 				offset++;
			}
			else if(e && dataFromServer[offset] === "-1"){
				// If the type of the entity is -1 that means the object was finished.
				offset++;
				// By tagging the entity as finished the engine will clean it up
				e.finished = true;
			}
			if(e && !e.finished) {
				// Update the existing entity with the remote data
				offset = e.renderRemoteData(dataFromServer,offset);
			}
		}
		s = this.remoteDataString.shift();
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

/*
 * Everything below this line needs to move into
 * either server or client settings files.
 */

// Configuration options, still need to make this nice
engine.ai = {};
engine.player1ai = engine.getItem("player1ai", 'heuristic');
engine.player2ai = engine.getItem("player2ai", 'heuristic');
engine.ufoai = engine.getItem("player2ai", 'heuristic');
engine.rendering = {};
engine.renderer = engine.getItem("renderer",'classic');
engine.effectsVolume = parseInt(engine.getItem("effectsVolume", 10));
engine.musicVolume = parseInt(engine.getItem("musicVolume", 40));
engine.maxScore = parseInt(engine.getItem("maxScore", 10));
engine.maxAiScore = parseInt(engine.getItem("maxAiScore", 10));

if(typeof(exports) !== 'undefined'){
	exports.engine = engine;
}
else {
	// The order of this list is important, the index
	// maps to what the ship emits as the first number 
	// in it's remoting data
	engine.remoteRenderer = [];
	engine.remoteRenderer.push(ship);
	engine.remoteRenderer.push(laserbeam);
	engine.remoteRenderer.push(star);
	engine.remoteRenderer.push(ufo);
	engine.remoteRenderer.push(explosion);
	engine.remoteRenderer.push(rules);
}


