/*
 *   Heuristic AI
 */
if(typeof(require) !== 'undefined'){
	var helpers = require("./../helpers").helpers;
	var engine = require("./../engine").engine;
}

engine.ai.ufo = function(){
	var previousPosition = this.position;
	// AI
	// Priority 1: staying alive
	// Avoid collisions
	var nearestEntityDistance = Infinity;
	var nearestEntity = null;
	var nearestStarDistance = Infinity;
	var nearestStar = null;
	var evading = false;
	// Determine the nearest object  
	for(var i = 0; i < this.engine.entities.length; i++){
		if(this.engine.entities[i] != this && this.engine.entities[i].owner != this && this.engine.entities[i].position){
			var d = helpers.distance(this.position, this.engine.entities[i].position);
			if(d < nearestEntityDistance){ 
				nearestEntityDistance = d;
				nearestEntity = this.engine.entities[i];
			}
			if(this.engine.entities[i].type == 'star' && this.engine.entities[i].colorIndex != this.colorIndex && d < nearestStarDistance){ 
				nearestStarDistance = d;
				nearestStar = this.engine.entities[i];
			}
		}
	}
	if(nearestEntity && nearestEntityDistance < 3){
		var deltax = nearestEntity.position.x - this.position.x;
		var deltay = nearestEntity.position.y - this.position.y;
		var targetVector = { 
		y: (deltay) < 0 ? 1 : -1,
		x: (deltax) < 0 ? 1 : -1
		};
		this.position = {
		x: this.position.x + ( targetVector.x * this.speed ) ,
		y: this.position.y + ( targetVector.y * this.speed )
		};
		evading = true;
	}
	// Priority 2: 
	// Select target
	var target = null;
	if(!target){
		target = nearestStar;
	}
	if(target){                    
		var deltax = target.position.x - this.position.x;
		var deltay = target.position.y - this.position.y;
		var targetVector = { 
		y: (deltay) < 0 ? -1 : 1,
		x: (deltax) < 0 ? -1 : 1
		};
		if(!evading){
			var movey = !(deltay < 10 && deltay > -10);
			var movex = !(deltax < 80 && deltax > -80);
			var reversex = (deltax < 60 && deltax > -60);
			this.position = {
			x: this.position.x + ( targetVector.x * (movex ? this.speed : (reversex ? -this.speed : 0 ) ) ),
			y: this.position.y + ( targetVector.y * (movey ? this.speed : 0) )
			};
		}
		if(this.position.x == previousPosition.x && this.direction != targetVector.x){
			this.direction = targetVector.x;
		}
		// Only shoot when
		// - the target is near (y)
		// - the ship is pointed in the right direction
		shoot = ((deltay < 40 && deltay > -40) && (this.direction == targetVector.x));
	}

	return {
		mousePosition: this.mousePosition,
		shoot: this.shoot
	};
};