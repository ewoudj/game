var touchController = function(config){
	if(config && config.engine){
		this.engine = config.engine;
	}
	this.resize();
	this.leftTouchID = -1; 
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
		for(var i = 0, l = this.touches.length; i < l; i++){
			var touch = this.touches[i];
			if(touch.identifier === this.leftTouchID){
				this.drawCircle(c, 'cyan', 6, this.leftTouchStartPos, 40);
				this.drawCircle(c, 'cyan', 2, this.leftTouchStartPos, 60);
				this.drawCircle(c, 'cyan', 2, this.leftTouchPos, 40); 
			} 
			else {
				this.drawCircle(c, 'red', 6, {x: touch.clientX, y: touch.clientY}, 40);
			}
		}
	}
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
			continue; 		
		} 
		else {	
			// Button down event 
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
			break; 		
		}		
	}
};




