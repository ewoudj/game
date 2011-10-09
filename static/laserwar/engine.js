/*
 *   Engine
 */
if(typeof(require) !== 'undefined'){
	var helpers = require("./helpers").helpers;
}

var engine = function(config){
	helpers.apply(config, this);
	if(this.mode == 'standalone' || this.mode == 'client'){
		this.canvas = document.getElementById('c');
		// Disable selection of text/elements in the browser
		document.onselectstart = function() {return false;}; // ie
		// document.onmousedown = function() {return false;}; // mozilla
		// Various client side init
		window.onmousemove = this.onmousemove.bind(this);
		this.canvas.onmousedown = this.onmousedown.bind(this);
		this.canvas.onmouseup = this.onmouseup.bind(this);
		this.renderer = new renderer({
			context: document.getElementById('c').getContext('2d')
		});
		document.body.style.background = this.pageColor;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		window.onresize = this.resize.bind(this);
		this.resize();
	}
	this.buttonDown = false;
	this.mousePosition = {x: 0, y: 0};
	this.buttonDown2 = false;
	this.mousePosition2 = {x: 0, y: 0};
	this.remoteRenderer = [];
	this.entities = [];
	this.remoteData = [];
	if(this.rulesType){
		this.add(new this.rulesType());
	}
	setInterval(this.update.bind(this), 38);
	
	if(this.mode == 'standalone' || this.mode == 'client'){
		setInterval(this.render.bind(this), 38);
	}
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
		for(var i = 0, l = this.entities.length; i < l; i++){
			this.entities[i].update(0);
		}
		// Filter out the objects that indicate they are finished
		for(var i = 0, l = this.entities.length; i < l; i++){
			var e1 = this.entities[i];
			if(!e1.finished){
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


engine.prototype.render = function(){
	this.renderer.context.fillStyle = this.canvasColor;
	this.renderer.context.fillRect(0, 0, this.width, this.height);
	// Render
	if(this.mode == 'standalone'){
		for(var i = 0, l = this.entities.length; i < l; i++){
			var e = this.entities[i];
			e.render();
			if(this.debug && e.collisionRect){
				this.renderer.drawRect(e.position, e.collisionRect, "#F00", false);
				if(e.target){
					this.renderer.drawLine(e.position, e.target.position, "#0f0");
				}
				if(e.evading){
					this.renderer.drawLine(e.position, e.nearestEntity.position, "#f00");
				}
			}
		}
	}
	else if(this.mode == 'client'){
		this.remoteData = this.remoteDataString.split(",");
		var offset = 0;
		var l = this.remoteData.length;
		while(offset < l){
			offset = this.remoteRenderer[this.remoteData[offset]].renderRemoteData(this.remoteData,offset);
		}
	}
};

engine.prototype.resize = function(){
	this.canvas.style.top = Math.ceil((window.innerHeight - this.height) / 2) + 'px';
	this.canvas.style.left = Math.ceil((window.innerWidth - this.width) / 2) + 'px';
};

engine.prototype.onmousemove = function(){
	this.mousePosition.x = event.clientX - this.canvas.offsetLeft;
	this.mousePosition.y = event.clientY - this.canvas.offsetTop;
};

engine.prototype.onmousedown = function(){
	this.buttonDown = true;
};

engine.prototype.onmouseup = function(){
	this.buttonDown = false;
};

engine.ai = {};
engine.player1ai = 'heuristic';
engine.player2ai = 'prioritizing';

if(typeof(exports) !== 'undefined'){
	exports.engine = engine;
}


