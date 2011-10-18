/*
 *   WebGL rendering
 */
if(typeof(require) !== 'undefined'){
	var helpers = require("./../helpers").helpers;
	var engine = require("./../engine").engine;
}

engine.rendering.webgl = function(){
	if(!this.renderer){
		this.renderer = true;
		var self = this;
		this.renderer = new webglRenderer({
			models: ['/laserwar/renderer/webgl/ship.js', 
			         '/laserwar/renderer/webgl/star.js',
			         '/laserwar/renderer/webgl/laser.js'],
			centerOffset: {x: this.width / 2, y: this.height / 2},
			callback: function(){
				self.rendererInitialized = true;
			}
		});
	}
	if(this.rendererInitialized){
		// Render
		if(this.mode == 'standalone'){
			for(var i = 0, l = this.entities.length; i < l; i++){
				var e = this.entities[i];			
				this.renderer.renderEntity(e);
			}
			this.renderer.renderScene();
		}
		else if(this.mode == 'client'){
			this.remoteData = this.remoteDataString.split(",");
			var offset = 0;
			var l = this.remoteData.length;
			while(offset < l){
				var e = this.remoteRenderer[this.remoteData[offset]];
				offset = e.renderRemoteData(this.remoteData,offset);
				this.renderer.renderEntity(e);
			}
		}
	}
};

var webglRenderer = function(config){
	helpers.apply({
		camera: new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 ), 
		scene: new THREE.Scene(), 
		renderer: new THREE.WebGLRenderer(), 
		loader:  new THREE.JSONLoader( true ),
		geometries: [],
		lastFrameNumber: 0
	}, this);
	this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );
	this.camera.position.z = 700;
	this.camera.position.x = 700;
	this.camera.lookAt({x:0,y:0,z:0});
	this.scene.add( new THREE.AmbientLight( 0x202020 ) );
	var directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.x = 0;
	directionalLight.position.y = 0;
	directionalLight.position.z = 1000;
	directionalLight.position.normalize();
	this.scene.add( directionalLight );
	this.scene.add( new THREE.PointLight( 0xffffff, 1 ) );
	config = config || {};
	helpers.apply(config, this);
	this.loadModelGeometries(config.models, config.callback);
};

var colorsBinary = {
  '#F00': 0xff0000, // Red
  '#0F0': 0x00ff00, // Green
  '#0FF': 0x00ffff, // Cyan
  '#FF0': 0xffff00, // Yellow
  '#F0F': 0xff00ff, // Purple
  '#00F': 0x0000ff, // Blue
  '#AAA': 0xaaaaaa, // 'Grey'
  '#FFF': 0xffffff, // White
  '#000': 0x000000 // Black
};

webglRenderer.prototype.renderEntity = function(e){
	if(!e.mesh){
		var scale = 12;
		e.mesh = new THREE.Mesh( 
			this.geometries[e.modelIndex || 0],
			new THREE.MeshPhongMaterial( { ambient: 0x060606, color: colorsBinary[e.color], shininess: 60, shading: THREE.FlatShading } )
			/*new THREE.MeshBasicMaterial({ 
				color: colorsBinary[e.color], 
				wireframe: false, 
				shading: THREE.SmoothShading
			)}*/
		);
		this.scene.add( e.mesh );
		e.mesh.gameMesh = true;
		e.mesh.gameColor = e.color;
		e.mesh.scale.set( scale, scale, scale );
		e.mesh.doubleSided = true;
		e.mesh.rotation.y = Math.PI * (e.direction === 1 ? 1.5 : 0.5);
	}
	if(e.mesh && e.position){
		e.mesh.lastFrameNumber = this.lastFrameNumber;
		if(e.mesh.gameColor !== e.color){
			e.mesh.materials[0] = new THREE.MeshPhongMaterial( { ambient: 0x060606, color: colorsBinary[e.color], shininess: 60, shading: THREE.FlatShading } )/*new THREE.MeshBasicMaterial({ 
				color: colorsBinary[e.color], 
				wireframe: false, 
				shading: THREE.SmoothShading
			})*/;
		}
		e.mesh.position.x = (e.position.x - this.centerOffset.x) * 2.5 ;
		e.mesh.position.y = (e.position.y - this.centerOffset.y) * -2.5 ;
		e.mesh.rotation.z += 0;
	}
};

webglRenderer.prototype.renderScene = function(){
	var children = this.scene.children.slice(0);
	for(var i = 0, l = children.length; i < l; i++){
		var m = children[i];
		if(m.gameMesh && m.lastFrameNumber !== this.lastFrameNumber){
			this.scene.remove(m);
		}
	}
	this.renderer.render( this.scene, this.camera );
	this.lastFrameNumber++;
};

webglRenderer.prototype.loadModelGeometries = function(configModels, callback){
	var models = configModels.slice(0); // The slice trick creates a shallow clone of the models array
	document.body.appendChild( this.loader.statusDomElement );
	this.loadNextModel(models, callback);
};

webglRenderer.prototype.loadNextModel = function(models, callback){
	var m = models.shift();
	if(!m){
		this.loader.statusDomElement.style.display = "none";
		callback();
	}
	else{
		var self = this;
		this.loader.load( { 
			model: m, 
			callback: function( geometry ) { 
				self.geometries.push( geometry );
				self.loadNextModel(models, callback);
			}
		});
	}
};