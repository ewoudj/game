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

scorebar.prototype.addScoreBarItem = function(text, color, offsetLeft){
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
	if(!this.texts){
		this.texts = [];
		this.addScoreBarItem("0", "#F00", 20);
		this.addScoreBarItem(" 0", "#FF0", this.engine.width - 95);
		this.addScoreBarItem("LASER WAR", "#FFF", 230);
	}
	this.texts[0].text = player1Score;
	this.texts[1].text = (player2Score < 10 ? ' ' : '') + player2Score;
};


