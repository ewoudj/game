/*
 *   Classic rendering render function. 
 *   'This' for this function will be the game 'engine'
 */
engine.rendering.classic = function(suspend){
	if(!this.classicRenderer){
		this.classicRenderer = new engine.rendering.classic.renderer({
			engine: this
		});
	}
	this.classicRenderer.suspend(suspend);
	if(!this.classicRenderer.suspended){
		this.classicRenderer.context.fillStyle = this.canvasColor;
		this.classicRenderer.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
		// Render
		if(this.mode == 'standalone' || this.mode == 'client'){
			for(var i = 0, l = this.entities.length; i < l; i++){
				var e = this.entities[i];
				if(e.render){
					e.render();
				}
				this.classicRenderer.renderEntity(e);
			}
		}
	}
};

// Class for classic renderer
engine.rendering.classic.renderer = function(){

	var renderer = function(config){
		helpers.apply(config, this);
		this.canvas = document.createElement('canvas');
		document.body.appendChild(this.canvas);
		this.canvas.style.position = 'absolute';
		this.canvas.onmousedown = this.onmousedown.bind(this);
		this.canvas.onmouseup = this.onmouseup.bind(this);
		window.onmousemove = this.onmousemove.bind(this);
		window.onresize = this.resize.bind(this);
		this.resize();
	};
	
	renderer.prototype.suspend = function(suspend){
		if(this.suspended && !suspend){
			this.canvas.style.display = 'block';
			window.onmousemove = this.onmousemove.bind(this);
			window.onresize = this.resize.bind(this);
			this.resize();
		}
		else if(!this.suspended && suspend){
			this.canvas.style.display = 'none';
		}
		this.suspended = suspend;
	};
	
	renderer.prototype.resize = function(){
		if(this.suspended) return;
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
	
	renderer.prototype.onmousemove = function(e){
		if(this.suspended) return;
		var evt = e || window.event;
		this.engine.mousePosition.x = Math.ceil((evt.clientX - this.offsetLeft) / this.scale);
		this.engine.mousePosition.y = Math.ceil((evt.clientY - this.offsetTop) / this.scale);
	};
	
	renderer.prototype.onmousedown = function(){
		if(this.suspended) return;
		this.engine.buttonDown = true;
	};
	
	renderer.prototype.onmouseup = function(){
		if(this.suspended) return;
		this.engine.buttonDown = false;
	};
	
	renderer.prototype.renderEntity = function(e){
		if(this.suspended) return;
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
	
	return renderer;
}();