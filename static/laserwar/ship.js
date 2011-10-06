/*
 *   User ship
 */
if(typeof(require) !== 'undefined'){
	var helpers = require("./helpers").helpers;
	var entity = require("./entity").entity;
	var explosion = require("./explosion").explosion;
	var colors; //require("./rules").colors;
	var sys = require("sys");
	for(var s in colors){
		sys.puts(s);
	};
	var laserbeam = require("./laserbeam").laserbeam;
}

var ship = function(config){
	helpers.apply(config, this);
	this.type = this.type || 'localplayer'; // localplayer, remoteplayer, computer
	this.laserState = 10; // 10 = ready, 0 = charging
	this.direction = this.direction || 1;
	this.colors = colors ? colors : require("./rules").colors;
	this.color = this.colors[this.colorIndex] || this.color || "#fff";
	this.speed = 3;
	this.colorLoop = 0;
	this.invulerability = 20;
	this.audioDone = false;
	this.name = this.name || 'ship';
	this.position = this.position || {x:0, y:0};
	this.gunOffset =  {x:0, y: 0};
	this.collisionRect = {x: -15, y: -10, w: 30,h: 20};
	this.rectsRight = [
		{x: -20, y: -15, w: 20, h: 10},
		{x: -10, y: -5, w: 30, h: 10},
		{x: -20, y: 5, w: 20, h: 10}
	];
	this.rectsLeft = [
		{x: 0, y: -15, w: 20, h: 10},
		{x: -20, y: -5, w: 30, h: 10},
		{x: 0, y: 5, w: 20, h: 10}
	];
};

ship.prototype = new entity();

ship.prototype.update = function(time){
	if(this.invulerability){
		this.invulerability--;
	}
	if(this.engine.gameState.player1Score == 10 || this.engine.gameState.player2Score == 10){
		this.engine.canvasColor = this.colors[this.colorLoop];
		this.colorLoop++;
		if(!(this.colorLoop < this.colors.length)){
			this.colorLoop = 0;
		}
	}
	else if(this.collisions && this.collisions.length){
		for(var i = 0; i < this.collisions.length; i++){
			if(this.collisions[i].owner != this && !(this.invulerability && this.collisions[i] == this.spawnStar)){
				if(!this.finished && this.collisions[i].owner == this.engine.gameState.player1Ship && this == this.engine.gameState.player2Ship){
					this.engine.gameState.player1Score++;
				}
				if(!this.finished && this.collisions[i].owner == this.engine.gameState.player2Ship && this == this.engine.gameState.player1Ship){
					this.engine.gameState.player2Score++;
				}
				this.finished = true;
				this.engine.add(new explosion({
					position: this.position
				}));
			}
		}
	}
	var previousPosition = this.position;
	this.shoot = false;
	if(this.type != 'computer'){
		if(this.engine.mode == 'standalone' || (this.name == "Player 1" && this.engine.player1)){
			this.shoot = this.engine.buttonDown;
			this.position = this.calculateMovement(this.position, this.engine.mousePosition, 10);//{x: this.engine.mousePosition.x, y: this.engine.mousePosition.y};
			//console.log("x:" + this.position.x + " , y:" + this.position.y);
		}
		else if(this.name == "Player 2" && this.engine.player2){
			this.shoot = this.engine.buttonDown2;
			this.position = {
					x: this.engine.mousePosition2.x, 
					y: this.engine.mousePosition2.y
			};
		}
	}
	else if(this.type == 'computer'){
		this.shipAI();
	}
	if(this.shoot && this.laserState == 10){
		this.laserState = 0;	
		this.engine.add(new laserbeam({
			position: {x:this.position.x + this.gunOffset.x, y:this.position.y + this.gunOffset.y},
			direction: this.direction,
			owner: this
		}));
	}
	else if(this.laserState < 10){
		this.laserState = this.laserState + 2;
	}
	else{
		this.laserState = 10;
	}
	if(this.position.x > previousPosition.x){
		this.direction = 1;
	}
	else if(this.position.x < previousPosition.x){
		this.direction = -1;
	}
	this.rects = this.direction == 1 ? this.rectsRight : this.rectsLeft;
};

ship.prototype.calculateMovement = function(currentPosition, mousePosition, speedLimit){
	var deltaX = mousePosition.x - currentPosition.x;
	var deltaY = mousePosition.y - currentPosition.y;
	var distance = helpers.distance(currentPosition, mousePosition);
	var f = 0.25;
	if(distance > 10){
		f = 10 / distance;
	}
	//var r = distance / speedLimit;
	return {
		x: this.position.x + (deltaX * f),
		y: this.position.y + (deltaY * f)
	};
};

ship.prototype.newShipAI = function(){
	
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
	for(var i = 0; i < this.engine.entities.length; i++){
		shootable = false;
		// Ignore self, entities owned by self (laserbeams) and entities without a position
		if(this.engine.entities[i] != this && this.engine.entities[i].owner != this && this.engine.entities[i].position){
			var value = 0;
			// Enemy ship has highest value
			if(this.engine.entities[i].type == 'player'){
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
				console.log('avoiding');
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
	this.position = this.calculateMovement(this.position, this.mousePosition, 10);
};

ship.prototype.shipAI = function(){
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

ship.prototype.render = function(){
	if(!this.audioDone){
		this.audioDone = true;
		audio.appearAudio.play();
	}
	this.engine.renderer.drawRects(helpers.ceilPoint(this.position), this.rects, this.color, true);
};

ship.prototype.getRemoteData = function(){
	var result = "0," + Math.ceil(this.position.x) + "," +
	              Math.ceil(this.position.y) + "," +
	              this.direction + "," +
	              this.color + "," +
	              (this.audioDone ? "1" :  "0");
	this.audioDone = true;
	return result;
};

ship.prototype.renderRemoteData = function(remoteData, offset){
	if(!(!!(parseFloat(remoteData[offset + 5])))){
		audio.appearAudio.play();
	}
	this.engine.renderer.drawRects(
			{x:parseFloat(remoteData[offset + 1]), y: parseFloat(remoteData[offset + 2])}, 
			remoteData[offset + 3] === "1"  ? this.rectsRight : this.rectsLeft, 
			remoteData[offset + 4], 
			true
	);
	return offset + 6;
};



if(typeof(exports) !== 'undefined'){
	exports.ship = ship;
}
