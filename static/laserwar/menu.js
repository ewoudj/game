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
    this.mainMenu = {
        'SINGLE PLAYER': {
            onMousePlaneUp: function (entity, evt) {
                entity.engine.rules.startSinglePlayerGame();
            }
        },
        'MULTI  PLAYER': {
//            submenu: {
//                'LOCAL': {},
//                'ONLINE': {}
            //            }
            onMousePlaneUp: function (entity, evt) {
                entity.engine.rules.startMultiPlayerGame();
            }
        },
        'ZERO   PLAYER': {
            onMousePlaneUp: function (entity, evt) {
                entity.engine.rules.startZeroPlayerGame();
            }
        },
        'SETTINGS': {
            onMousePlaneUp: function (entity, evt) {
                entity.engine.rules.toggleSettings();
            }
        },
        'CREDITS': {}
    };
    this.setItems(this.mainMenu);
};
menu.prototype = new entity();

menu.prototype.gotoRoot = function () {
    this.setItems(this.mainMenu);
};

menu.prototype.onmouseup = function(entity, hit){
	if(this.selected && this.selected.onMousePlaneUp){
		this.selected.onMousePlaneUp(this, this);
	}
};

menu.prototype.setItems = function(items){
	this.clear();
	this.texts = [];
	var i = 0;
	for(var s in items){
		var config = helpers.apply(items[s],{
			font: '50px CBM64', 
			color: this.color,
			engine: this.engine,
			text: s, 
			position: { 
				x: this.engine.width / 5, 
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
		if(index > -1 && index < this.texts.length){
			this.select(this.texts[index]);
		}
		else{
			this.select(null);
		}
	}
};

menu.prototype.render = function(time){

};
