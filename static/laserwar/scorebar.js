/*
 *   Score bar
 */

var scorebar = function(config){
	helpers.apply(config, this);
	this.name = 'scorebar';
	if(this.engine.mode == 'standalone' || this.engine.mode == 'client'){
		this.geometry = new THREE.CubeGeometry(1, (50 * 2.5 / 12), ((this.engine.width - 30) * 2.5) / 12);
	}
	this.position = {
		x: this.engine.width / 2 , 
		y: this.engine.height - 36, 
		z: -40
	};
	this.classicModel = [{x:-(this.engine.width - 30) / 2,y: -25,w: this.engine.width - 30, h: 50}];
	this.direction = 1;
	this.finished = false;
	this.modelIndex = -1;
	this.color = '#00F';
};
scorebar.prototype = new entity();

scorebar.prototype.to3dText = function(text){
	var result = null;
	if(this.engine.mode == 'standalone' || this.engine.mode == 'client'){
		result = new THREE.TextGeometry( text, {
			size: 90,
			height: 10,
			curveSegments: 0,
			font: "cbm-64"
		});
	}
	return result;
};

scorebar.prototype.addScoreBarItem = function(text, color, offsetLeft){
	this.subEntities.push({
		modelIndex: text,
		score: 0,
		geometry: this.to3dText( text ),
		modelScale: 1,
		color: color,
		position: { 
			x: offsetLeft, 
			y: this.engine.height - 15,
			z: -25
		},
		rotation: {
			x: 0, y:0, z:0
		},
		direction: -1
	});
	this.texts.push({
		font: '50px CBM64', 
		color: color, 
		text: text, 
		position: { 
			x: offsetLeft, 
			y: this.engine.height - 15
		} 
	});
};

scorebar.prototype.setScore = function(player1Score, player2Score){
	if(!this.subEntities){
		this.subEntities = [];
		this.texts = [];
		this.addScoreBarItem("0", "#F00", 20);
		this.addScoreBarItem(" 0", "#FF0", this.engine.width - 95);
		this.addScoreBarItem("LASER WAR", "#FFF", 230);
	}
	this.texts[0].text = player1Score;
	this.texts[1].text = (player2Score < 10 ? ' ' : '') + player2Score;
	if(this.subEntities[0].score != player1Score){
		this.subEntities[0].score = player1Score;
		this.subEntities[0].mesh = null;
		this.subEntities[0].modelIndex = this.texts[0].text;
		this.subEntities[0].geometry = this.to3dText( this.texts[0].text );
	}
	if(this.subEntities[1].score != player2Score){
		this.subEntities[1].score = player2Score;
		this.subEntities[1].mesh = null;
		this.subEntities[1].modelIndex = this.texts[1].text;
		this.subEntities[1].geometry = this.to3dText( this.texts[1].text );
	}
};


