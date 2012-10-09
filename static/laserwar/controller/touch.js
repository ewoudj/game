var touchController = function(config){
	if(config && config.engine){
		this.engine = config.engine;
	}
	this.resize();
	this.leftTouchID = -1;
	this.rightTouchID = -1;
	this.secondRightTouchID = -1;
	this.leftTouchPos = {x: 0, y: 0};
	this.leftTouchStartPos = {x: 0, y: 0};
	this.leftVector = {x: 0, y: 0};
	this.touchable = 'createTouch' in document; // is this running in a touch capable environment?
	this.touches = []; // array of touch vectors
	if(this.touchable) {
		window.addEventListener( 'touchstart', this.onTouchStart.bind(this), false );
		window.addEventListener( 'touchmove', this.onTouchMove.bind(this), false );
		window.addEventListener( 'touchend', this.onTouchEnd.bind(this), false );  
	}
}; 

touchController.prototype.resize = function (e) {  
	this.halfWidth = window.innerWidth / 2; 
	this.halfHeight = window.innerHeight / 2;
};

touchController.prototype.render = function(c) { // c is the canvas' context 2D
	if(this.touchable) {
		var circleColor = 'rgba(255,255,255,0.18)';
		var renderedStick = false;
		var renderedButton = false;
		for(var i = 0, l = this.touches.length; i < l; i++){
			var touch = this.touches[i];
			if(touch.identifier === this.leftTouchID){
				this.drawCircle(c, circleColor, 6, this.leftTouchPos, 40);
				this.drawCircle(c, circleColor, 2, this.leftTouchStartPos, 60);
				this.drawCircle(c, circleColor, 2, this.leftTouchStartPos, 40);
				renderedStick = true;
			} 
			else {
				this.drawCircle(c, circleColor, 6, {x: touch.clientX, y: touch.clientY}, 50);
				renderedButton = true;
			}
		}
		if(!renderedStick){
			var position = {x: 70, y: window.innerHeight - 70};
			this.drawCircle(c, circleColor, 6, position, 40);
			this.drawCircle(c, circleColor, 2, position, 60);
		}
		if(!renderedButton){
			this.drawCircle(c, circleColor, 6, {x: window.innerWidth - 70, y: window.innerHeight - 70}, 50);
		}
		this.drawCircle(c, circleColor, 3, {x: window.innerWidth - 20, y: 40}, 15);
		this.drawLine(c, circleColor, 3, {x: window.innerWidth - 27, y: 35}, {x: window.innerWidth - 13, y: 35});
		this.drawLine(c, circleColor, 3, {x: window.innerWidth - 27, y: 40}, {x: window.innerWidth - 13, y: 40});
		this.drawLine(c, circleColor, 3, {x: window.innerWidth - 27, y: 45}, {x: window.innerWidth - 13, y: 45});
	}
};

touchController.prototype.inMenuArea = function(touchX, touchY) {
	return (touchX > (window.innerWidth - 45) && touchY < 55);
};

touchController.prototype.drawLine = function(c, color, lineWidth, start, end) { // c is the canvas' context 2D
	c.beginPath(); 
	c.strokeStyle = color; 
	c.lineWidth = lineWidth; 
    c.moveTo(start.x, start.y);
    c.lineTo(end.x, end.y);
    c.closePath();
    c.stroke(); 
};

touchController.prototype.drawCircle = function(c, color, lineWidth, center, radius) { // c is the canvas' context 2D
	c.beginPath(); 
	c.strokeStyle = color; 
	c.lineWidth = lineWidth; 
	c.arc(center.x, center.y, radius, 0, Math.PI * 2, true); 
	c.stroke();
};

touchController.prototype.onTouchStart = function(e) {
	for(var i = 0, l = e.changedTouches.length; i < l; i++){
		var touch = e.changedTouches[i]; 
		if((this.leftTouchID < 0) && (touch.clientX < this.halfWidth)) {
			this.leftTouchID = touch.identifier; 
			this.leftTouchStartPos = {x: touch.clientX, y: touch.clientY}; 	
			this.leftTouchPos = {x: touch.clientX, y: touch.clientY}; 
			this.leftVector = {x: 0, y: 0};	
		}
		else if(this.inMenuArea(touch.clientX, touch.clientY)){	
			// Button down event
			this.secondRightTouchID = touch.identifier;
			this.engine.rightButtonDown = true;
		}
		else if(this.rightTouchID < 0){	
			// Button down event
			this.rightTouchID = touch.identifier;
			this.engine.buttonDown = true;
		}	
	}
	this.touches = e.touches; 
};
	
touchController.prototype.onTouchMove = function(e) {
	e.preventDefault(); // Prevent the browser from doing its default thing (scroll, zoom)
	for(var i = 0, l = e.changedTouches.length; i < l; i++){
		var touch = e.changedTouches[i]; 
		if(this.leftTouchID === touch.identifier){
			this.leftTouchPos = {x: touch.clientX, y: touch.clientY}; 
			this.leftVector = {x: touch.clientX - this.leftTouchStartPos.x, y: touch.clientY - this.leftTouchStartPos.y};
			this.engine.mousePosition = {
				x: Math.floor(this.leftVector.x / 5),
				y: Math.floor(this.leftVector.y / 5)
			};
			this.engine.absoluteController = false;
			break; 		
		}		
	}
	this.touches = e.touches; 
};

touchController.prototype.onTouchEnd = function(e) { 
	this.touches = e.touches;
	for(var i = 0, l = e.changedTouches.length; i < l; i++){
		var touch = e.changedTouches[i];
		if(this.leftTouchID === touch.identifier){
			this.leftTouchID = -1; 
			this.leftVector = {x: 0, y: 0};
			this.engine.mousePosition = this.leftVector;
			this.engine.absoluteController = false; 		
		}
		else if(this.rightTouchID === touch.identifier){
			this.rightTouchID = -1;
			this.engine.buttonDown = false;
		}
		else if(this.secondRightTouchID === touch.identifier && this.inMenuArea(touch.clientX, touch.clientY)){
			this.secondRightTouchID = -1;
			this.engine.rightButtonDown = false;
		}
	}
};




