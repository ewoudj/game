var menu = function (config) {
    helpers.apply({
        color: '#AAA',
        selectedColor: '#FFF',
        mousePlaneOffset: 250,
        mousePlane: 'z',
        topMost: true,
        onmouseup: this.onmouseup.bind(this)
    }, this);
    helpers.apply(config, this);
    this.setItems(this.mainMenu);
};
menu.prototype = new entity();

menu.prototype.gotoRoot = function () {
    this.setItems(this.mainMenu);
};

menu.prototype.onmouseup = function(entity, hit){
	if(this.ignoreNextButtonUp){
		this.ignoreNextButtonUp = false;
	}
	else{
		if(this.selected && this.selected.onMousePlaneUp){
			this.selected.onMousePlaneUp(this, this);
		}
	}
};

menu.prototype.setItems = function(items){
	if(this.engine.buttonDown){
		this.ignoreNextButtonUp = true;
	}
	this.currentItems = items;
	this.clear();
	this.texts = [];
	var i = 0;
	for(var s in items){
		var text = s;
		if(items[s].getText){
			text = items[s].getText(this);
		}
		var config = helpers.apply(items[s],{
			font: '50px CBM64', 
			color: this.color,
			engine: this.engine,
			text: text, 
			position: { 
				x: 0, // this.engine.width / 5, 
				y: (this.engine.height / 3) + ( i * 60),
				z: this.mousePlaneOffset
			}
		});
		if(config.submenu){
			var self = this;
			config.onMousePlaneUp = function(entity, hit){
				self.setItems(entity.submenu);
			};
		}
		this.texts.push(config);
		i++;
	}
};

menu.prototype.show = function (items) {
    if (this.finished) {
        this.finished = false;
        if(!this.engine.contains(this)){
        	this.engine.add(this);
        }
        this.gotoRoot();
    }
    if(items){
    	this.setItems(items);
    }
};

menu.prototype.toggle = function () {
    if (this.finished) {
        this.finished = false;
        if(!this.engine.contains(this)){
        	this.engine.add(this);
        }
        this.gotoRoot();
    }
    else {
        this.finished = true;
    }
};

menu.prototype.hide = function () {
    this.finished = true;
};

menu.prototype.clear = function(){
	if(this.subEntities){
		for(var i = 0, l = this.subEntities.length; i < l; i++){
			this.subEntities[i].finished = true;
		}
	}
};

menu.prototype.select = function(entity){
	if(this.selected != entity){
		if(this.selected){
			this.selected.color = this.color;
		}
		this.selected = entity;
		if(this.selected){
			this.selected.color = this.selectedColor;
		}
	}
};

menu.prototype.update = function(time){
	if(this.mousePosition && this.texts){
		// Calculate item on the same height as the mouse
		var index = Math.floor( (this.mousePosition.y - (this.engine.height / 3)) / 60 ) + 1;
		if(index > -1 && index < this.texts.length && this.texts[index].onMousePlaneUp){
			this.select(this.texts[index]);
		    if(this.engine.touchController.touchable){
		    	this.onmouseup(this.texts[index], true);
		    	this.ignoreNextButtonUp = true;
		    }
		}
		else{
			this.select(null);
		}
	}
};

menu.prototype.render = function(time){

};
