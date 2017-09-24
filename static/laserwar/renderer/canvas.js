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
			var topMost = [];
			this.classicRenderer.ensureSize();
			for(var i = 0, l = this.entities.length; i < l; i++){
				var e = this.entities[i];
				if(e.topMost){
					topMost.push(e);
				}
				else {
					this.classicRenderer.renderEntity(e);
				}
			}
			for(var i = 0, l = topMost.length; i < l; i++){
				this.classicRenderer.renderEntity(topMost[i]);
			}
			for(var i = 0, l = this.controllers.length; i < l; i++){
				var controller = this.controllers[i];
				if(controller.render){
					controller.render(this.classicRenderer.context);
				}
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
		document.body.style.backgroundColor = '#000';
		this.canvas.style.position = 'absolute';
		this.canvas.style.backgroundColor = '#000';
		this.canvas.onmousedown = this.onmousedown.bind(this);
		this.canvas.onmouseup = this.onmouseup.bind(this);
		window.onmousemove = this.onmousemove.bind(this);
		window.onresize = this.resize.bind(this);
		this.resize();
	};

	renderer.prototype.ensureSize = function(){
		if(this.canvas.width != window.innerWidth
			|| this.canvas.height != window.innerHeight){
				this.resize();
			}
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
		//if(this.suspended) return;
		this.canvas.style.top = '0px';
		this.canvas.style.left = '0px';
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		// Calculate optimum scale
		var scaleh = this.canvas.width / this.engine.width;
		var scalev = this.canvas.height / this.engine.height;
		this.scale = (scaleh < scalev) ? scaleh : scalev;
		this.offsetTop = Math.ceil((this.canvas.height - (this.engine.height * this.scale)) / 2);
		if(this.engine.touchController.touchable && this.offsetTop > 40){
			this.offsetTop = 40;
		}
		this.offsetLeft = Math.ceil((this.canvas.width - (this.engine.width * this.scale)) / 2);
		this.context = this.canvas.getContext('2d');
		for(var i = 0, l = this.engine.controllers.length; i < l; i++){
			var controller = this.engine.controllers[i];
			if(controller.render){
				controller.resize();
			}
		}
	};
	
	renderer.prototype.notify = function(eventName, entities){
		if(entities && eventName){
			for(var i = 0, l = entities.length; i < l; i++ ){
	    		if(entities[i][eventName]){
	    			entities[i][eventName](entities[i], entities[i]);
	    		}
	    	}
		}
	};
	
	renderer.prototype.onmousemove = function(e){
		if(this.suspended) return;
		var evt = e || window.event;
		var newPosition = {
			x: ((evt.clientX - this.offsetLeft) / this.scale),
			y: ((evt.clientY - this.offsetTop) / this.scale)
		};
		if(!this.engine.touchController.touchable){
			this.engine.mousePosition = newPosition;
			this.engine.absoluteController = true;
		}
		var items = this.engine.entities;
		this.mouseEntities = [];
	    for(var i = 0, l = items.length; i < l; i++){
	    	var item = items[i];
	    	if(item.mousePlane){
	    		item.mousePosition = newPosition;
	    		this.mouseEntities.push(item);
	    	}
	    }
	    this.notify('onmousemove', this.mouseEntities);
	};
	
	renderer.prototype.onmousedown = function(){
		if(this.suspended) return;
		if(!this.engine.touchController.touchable){
			this.engine.buttonDown = true;
		}
		this.notify('onmousedown', this.mouseEntities);
	};
	
	renderer.prototype.onmouseup = function(){
		if(this.suspended) return;
		if(!this.engine.touchController.touchable){
			this.engine.buttonDown = false;
		}
		this.notify('onmouseup', this.mouseEntities);
        // This is a ugly hack to initialize audio on iOS
        // audio on is enabled after user input
        audio.afterInput();
	};
	
	renderer.prototype.renderEntity = function(e){
		if(this.suspended) return;
		if(e.render){
			e.render();
		}
		if(e.classicModel) {
			this.drawRects({x: e.position.x, y: e.position.y}, e.classicModel, e.color, true);
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
				((rect.x + offset.x) * this.scale) + this.offsetLeft ,
				((rect.y + offset.y) * this.scale) + this.offsetTop  ,
				(rect.w * this.scale) ,
				((rect.h + 2) * this.scale) 
			);
		}
		else {
			this.context.strokeStyle = color;
			this.context.strokeRect(
				((rect.x + offset.x) * this.scale) ,
				((rect.y + offset.y) * this.scale) ,
				(rect.w * this.scale) ,
				(rect.h * this.scale) 
			);
		}
	};
	
	return renderer;
}();