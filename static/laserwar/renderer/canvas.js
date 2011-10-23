/*
 *   Classic rendering
 */
if(typeof(require) !== 'undefined'){
	var helpers = require("./../helpers").helpers;
	var engine = require("./../engine").engine;
}

engine.rendering.classic = function(){
	if(!this.renderer){
		this.renderer = new renderer({
			engine: this
		});
	}
	this.renderer.context.fillStyle = this.canvasColor;
	this.renderer.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
	// Render
	if(this.mode == 'standalone'){
		for(var i = 0, l = this.entities.length; i < l; i++){
			var e = this.entities[i];
			e.render();
			this.renderer.renderEntity(e);
		}
	}
	else if(this.mode == 'client'){
		this.remoteData = this.remoteDataString.split(",");
		var offset = 0;
		var l = this.remoteData.length;
		while(offset < l){
			var e = this.remoteRenderer[this.remoteData[offset]];
			offset = e.renderRemoteData(this.remoteData,offset);
			this.renderer.renderEntity(e);
		}
	}
};

var renderer = function(config){
	helpers.apply(config, this);
	this.canvas = document.createElement('canvas');//document.getElementById('c');
	document.body.appendChild(this.canvas);
	this.canvas.style.position = 'absolute';
	this.canvas.onmousedown = this.onmousedown.bind(this);
	this.canvas.onmouseup = this.onmouseup.bind(this);
	window.onmousemove = this.onmousemove.bind(this);
	window.onresize = this.resize.bind(this);
	this.resize();
};

renderer.prototype.resize = function(){
	this.canvas.style.top = '0px';
	this.canvas.style.left = '0px';
	this.canvas.width = window.innerWidth;
	this.canvas.height = window.innerHeight;
	// Calculate optimum scale
	var scaleh = this.canvas.width / this.engine.width;
	var scalev = this.canvas.height / this.engine.height;
	this.scale = (scaleh < scalev) ? scaleh : scalev;
	this.offsetTop = Math.ceil((this.canvas.height - (this.engine.height * this.scale)) / 2);
	this.offsetLeft = Math.ceil((this.canvas.width - (this.engine.width * this.scale)) / 2);
	this.context = this.canvas.getContext('2d');
};

renderer.prototype.onmousemove = function(){
	this.engine.mousePosition.x = Math.ceil((event.clientX - this.offsetLeft) / this.scale);
	this.engine.mousePosition.y = Math.ceil((event.clientY - this.offsetTop) / this.scale);
};

renderer.prototype.onmousedown = function(){
	this.engine.buttonDown = true;
};

renderer.prototype.onmouseup = function(){
	this.engine.buttonDown = false;
};

renderer.prototype.renderEntity = function(e){
	if(e.classicModel) {
		this.drawRects(helpers.ceilPoint({x: e.position.x, y: e.position.y}), e.classicModel, e.color, true);
	}
	if(e.texts){
		for(var j = 0, l = e.texts.length; j < l; j++ ){
			var t = e.texts[j];
			this.context.font = Math.ceil(50 * this.scale) + 'px CBM64';
			this.context.fillStyle = t.color;
			this.context.fillText(t.text, Math.ceil(t.position.x * this.scale) + this.offsetLeft, Math.ceil(t.position.y * this.scale) + this.offsetTop);
		}
	}
};

renderer.prototype.drawRects = function(offset, rects, color, fill){
	if(rects){
		for(var i = 0, l = rects.length; i < l; i++){
			this.drawRect(offset, rects[i], color, fill);
		}
	}
};

renderer.prototype.drawRect = function(offset, rect, color, fill){
	if(fill){
		this.context.fillStyle = color;
		this.context.fillRect(
			Math.ceil((rect.x + offset.x) * this.scale) + this.offsetLeft ,
			Math.ceil((rect.y + offset.y) * this.scale) + this.offsetTop  ,
			Math.ceil(rect.w * this.scale) ,
			Math.ceil(rect.h * this.scale) 
		);
	}
	else {
		this.context.strokeStyle = color;
		this.context.strokeRect(
			Math.ceil((rect.x + offset.x) * this.scale) ,
			Math.ceil((rect.y + offset.y) * this.scale) ,
			Math.ceil(rect.w * this.scale) ,
			Math.ceil(rect.h * this.scale) 
		);
	}
};