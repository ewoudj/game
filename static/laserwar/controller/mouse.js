var mouseController = function(config){
	if(config && config.engine){
		this.engine = config.engine;
	}
	this.buttonDown = false;
	this.enabled = false;
	this.controllerType = 'absolute'; // absolute (e.g. mouse) or relative (e.g. joystick)
	this.mousePosition = {x:0, y:0};
	this.touchable = 'createTouch' in document; // is this running in a touch capable environment?
	if(!this.touchable) { // Disable the mouse controller for devices that support touch
		this.enabled = true;
		if(document.addEventListener) { // Opera - Firefox - Google Chrome
			document.addEventListener("mousedown", this.down.bind(this), false);
			document.addEventListener("mousemove", this.move.bind(this), false);
			document.addEventListener("mouseup", this.up.bind(this), false);
		}
		else if(document.attachEvent) { // Internet Explorer
			document.attachEvent("onmousedown", this.down.bind(this));
			document.attachEvent("onmousemove", this.move.bind(this));
			document.attachEvent("onmouseup", this.up.bind(this));
		}
		else if(!document.onmousedown && !document.onmouseup) {
			document.onmousedown = this.down.bind(this);
			document.onmousemove = this.move.bind(this);
			document.onmouseup = this.up.bind(this);
		} 
	}
}; 

mouseController.prototype.down = function (e) {  
	this.buttonDown = true;
};

mouseController.prototype.move = function (e) {  
	this.mousePosition = {x: e.clientX, y: e.clientY};
};

mouseController.prototype.up = function (e) {  
	this.buttonDown = false;
};