/*
 *   Heuristic AI
 */
if(typeof(require) !== 'undefined'){
	var engine = require("./../engine").engine;
}

engine.ai.heuristic = function(){
	var previousPosition = this.position;
	// AI
	// Priority 1: staying alive
	// Avoid collisions
	var nearestEntityDistance = Infinity;
	this.nearestEntity = null;
	var nearestStarDistance = Infinity;
	var nearestStar = null;
	this.evading = false;
	// Determine the nearest object  
	for(var i = 0; i < this.engine.entities.length; i++){
		if(this.engine.entities[i] != this && this.engine.entities[i].owner != this && this.engine.entities[i].position){
			var d = helpers.distance(this.position, this.engine.entities[i].position);
			if(d < nearestEntityDistance){ 
				nearestEntityDistance = d;
				this.nearestEntity = this.engine.entities[i];
			}
			if(this.engine.entities[i].type == 'star' && this.engine.entities[i].colorIndex != this.colorIndex && d < nearestStarDistance){ 
				nearestStarDistance = d;
				nearestStar = this.engine.entities[i];
			}
		}
	}
	if(( this.position && this.nearestEntity) && nearestEntityDistance < 50 || this.evadingTime > 0){
		var deltax = this.nearestEntity.position.x - this.position.x;
		var deltay = this.nearestEntity.position.y - this.position.y;
		this.targetVector = { 
			y: (deltay) < 0 ? 1 : 1,
			x: (deltax) < 0 ? 1 : 1
		};
		if(!this.evadingTime){
			this.evadingTime = 3;
		}
		this.evadingTime--;
		this.position = helpers.rotate(this.position, this.nearestEntity.position, -25);
		this.evading = true;
	}
	// Priority 2: 
	// Select target
	this.target = this.engine.gameState.player1Ship.finished ? null : this.engine.gameState.player1Ship;
	if(!this.target){
		this.target = nearestStar;
	}
	if(this.target){                    
		var deltax = this.target.position.x - this.position.x;
		var deltay = this.target.position.y - this.position.y;
		this.targetVector = { 
			y: (deltay) < 0 ? -1 : 1,
			x: (deltax) < 0 ? -1 : 1
		};
		if(!this.evading){
			var movey = !(deltay < 10 && deltay > -10);
			var movex = !(deltax < 80 && deltax > -80);
			var reversex = (deltax < 60 && deltax > -60);
			this.position = {
				x: this.position.x + ( this.targetVector.x * (movex ? this.speed : (reversex ? -this.speed : 0 ) ) ),
				y: this.position.y + ( this.targetVector.y * (movey ? this.speed : 0) )
			};
		}
		if(this.position.x == previousPosition.x && this.direction != this.targetVector.x){
			this.direction = this.targetVector.x;
		}
		// Only shoot when
		// - the target is near (y)
		// - the ship is pointed in the right direction
		this.shoot = ((deltay < 40 && deltay > -40) && (this.direction == this.targetVector.x));
	}
};