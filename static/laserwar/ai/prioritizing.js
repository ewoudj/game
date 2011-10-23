/*
 *   Prioritizing AI
 */
if(typeof(require) !== 'undefined'){
	var helpers = require("./../helpers").helpers;
	var engine = require("./../engine").engine;
}


engine.ai.prioritizing = function(){
	var myStars = 0;
	var maxDistance = Math.sqrt(Math.pow(this.engine.width,2) + Math.pow(this.engine.width,2));
	var highestValue = 0;
	var mousePosition = null;
	this.shoot = false;
	var shootable = false;
	if(!this.responseDelay){
		this.responseDelay = 0;
	}
	else{
		this.responseDelay--;
	}
	if(this.starShootDelay){
		this.starShootDelay--;
	}
	// Calculate the number of stars in the ship's color
	for(var i = 0; i < this.engine.entities.length; i++){
		if(this.engine.entities[i].type == 'star' && this.engine.entities[i].colorIndex == this.colorIndex){ 
			myStars++;
		}
	}
	for(var i = 0, l = this.engine.entities.length; i < l; i++){
		shootable = false;
		// Ignore self, entities owned by self (laserbeams) and entities without a position
		if(this.engine.entities[i] != this && this.engine.entities[i].owner != this && this.engine.entities[i].position){
			var value = 0;
			// Enemy ship has highest value
			if(this.engine.entities[i].type === 'player' || this.engine.entities[i].type === 'computer'){
				value = 30;
				shootable = true;
			}
			else if(this.engine.entities[i].type == 'star' && this.engine.entities[i].colorIndex != this.colorIndex){
				// Values of stars is higher when there are only a few in the ships color
				value = 10;
				if(myStars == 0){
					value += 20;
				}
				if(myStars == 1){
					value += 10;
				}
				if(!this.starShootDelay){
					shootable = true;
					this.starShootDelay = 10;
				}
			}
			// Ufo have lowest value
			else if(this.engine.entities[i].type == 'ufo'){
				value = 5;
				shootable = true;
			}
			// Distance decreases the value
			var distance = helpers.distance(this.position, this.engine.entities[i].position);
			var avoidCollision = (distance < 50);
			if( avoidCollision ){
				value = 100;
			}
			var f = maxDistance / distance;
			//value = value + (2 * f);
			if(value > highestValue){
				highestValue = value;
				//if(this.responseDelay == 0){
					this.responseDelay = 1;
					this.mousePosition = {
						x: this.engine.entities[i].position.x + 110,
						y: this.engine.entities[i].position.y
					};
					if(avoidCollision){
						this.mousePosition.x = (this.mousePosition.x - this.position.x) * -100000;
						this.mousePosition.y = (this.mousePosition.y - this.position.y) * -100000;
					}
				//}
				var deltay = Math.abs(this.position.y - this.engine.entities[i].position.y);
				if(shootable && deltay < 30){
					this.shoot = shootable;
				}
			}
		}
	}
	return {
		mousePosition: this.mousePosition,
		shoot: this.shoot
	};
};