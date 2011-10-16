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
			context: document.getElementById('c').getContext('2d')
		});
	}
	this.renderer.context.fillStyle = this.canvasColor;
	this.renderer.context.fillRect(0, 0, this.width, this.height);
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
};

renderer.prototype.renderEntity = function(e){
	if(e.classicModel) {
		this.drawRects(helpers.ceilPoint(e.position), e.classicModel, e.color, true);
	}
	if(e.texts){
		for(var j = 0, l = e.texts.length; j < l; j++ ){
			var t = e.texts[j];
			this.context.font = t.font;
			this.context.fillStyle = t.color;
			this.context.fillText(t.text, t.position.x, t.position.y);
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
		this.context.fillRect(rect.x + offset.x ,rect.y + offset.y ,rect.w,rect.h);
	}
	else {
		this.context.strokeStyle = color;
		this.context.strokeRect(rect.x + offset.x ,rect.y + offset.y ,rect.w,rect.h);
	}
};

renderer.prototype.drawLine = function(pointA, pointB, color){
	this.context.beginPath();
	this.context.strokeStyle = color;
	this.context.moveTo(pointA.x, pointA.y);
	this.context.lineTo(pointB.x, pointB.y);
	this.context.stroke();
};