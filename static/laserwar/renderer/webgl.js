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
			         '/laserwar/renderer/webgl/ufo1.js',
			         '/laserwar/renderer/webgl/ufo2.js',
			         '/laserwar/renderer/webgl/ufo3.js',
			         '/laserwar/renderer/webgl/laser.js',
			         '/laserwar/renderer/webgl/cube.js'
	        ],
			centerOffset: {x: this.width / 2, y: this.height / 2},
			engine: this,
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
		lastFrameNumber: 0,
		modelScale: 12,
		gameScale: 2.5
	}, this);
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	this.canvas = this.renderer.domElement;
    document.body.appendChild( this.canvas );
	this.canvas.onmousedown = this.onmousedown.bind(this);
	this.canvas.onmouseup = this.onmouseup.bind(this);
    window.onmousemove = this.onmousemove.bind(this);
    window.onresize = this.resize.bind(this);
    // the 'background', used for 'flickering' and getting mouse coordinates
    this.backgroundPlane = new THREE.Mesh( 
		new THREE.PlaneGeometry(config.engine.width, config.engine.height),
		new THREE.MeshBasicMaterial( { 
			ambient: 0x000000, 
			color: 0x000000
		})
	);
    this.backgroundPlane.scale.set( this.gameScale, this.gameScale, this.gameScale );
    this.backgroundPlane.position.z = -50;
    this.scene.add(this.backgroundPlane);
    // Text for rendering the score, etc
    var text3d = new THREE.TextGeometry( " 0     LASER WAR     0", {
		size: 80,
		height: 10,
		curveSegments: 1,
		font: "cbm-64"
	});
	var text = new THREE.Mesh( text3d, this.createMaterial(0xffffff) );
	text.doubleSided = true;
	text.position.x = -950;
	text.position.y = -635;
	text.position.z = -25;
	//text.overdraw = true;
	var parent = new THREE.Object3D();
	parent.add( text );
	this.scene.add( parent );
	// Initial camera position and look at
	this.camera.position.z = 1000;
	this.camera.position.x = 0;
	this.camera.position.y = 0;
	this.camera.lookAt({x:0,y:0,z:0});
	this.scene.add( new THREE.AmbientLight( 0x202020 ) );
	var directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.x = 0;
	directionalLight.position.y = 0;
	directionalLight.position.z = 1000;
	directionalLight.position.normalize();
	this.scene.add( directionalLight );
	this.scene.add( new THREE.PointLight( 0xffffff, 1 ) );
//	this.composer = new THREE.EffectComposer( this.renderer );
//	var renderPass = new THREE.RenderPass( this.scene, this.camera );
//	this.composer.addPass( new THREE.RenderPass( this.scene, this.camera ) );
//	//this.composer.addPass( new THREE.BloomPass( 2 ) );
//	this.composer.addPass( new THREE.FilmPass( 0.5, 0.025, 648, false ) );
//	this.composer.addPass( new THREE.ShaderPass( THREE.ShaderExtras[ "bleachbypass" ] ) );
//	var effectVignette = new THREE.ShaderPass( THREE.ShaderExtras[ "vignette" ] );
//	effectVignette.uniforms[ "offset" ].value = 0.95;
//	effectVignette.uniforms[ "darkness" ].value = 1.6;
//	effectVignette.renderToScreen = true;
//	this.composer.addPass( effectVignette );
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

webglRenderer.prototype.onmousemove = function(e){
    var mouse_pos = new THREE.Vector2(e.clientX, e.clientY);
    var hit_points = this.pick(mouse_pos, this.backgroundPlane);
    if (hit_points.length > 0) {
        var pos = this.worldMouse = hit_points[0].point;        
        this.engine.mousePosition.x = Math.ceil((pos.x / this.gameScale) + this.centerOffset.x);
    	this.engine.mousePosition.y = (this.engine.height - Math.ceil((pos.y / this.gameScale) + this.centerOffset.y));
    	// console.log(pos.x + ", " + pos.y + ' => ' + this.engine.mousePosition.x + ", " + this.engine.mousePosition.y);
    }
};

webglRenderer.prototype.onmousedown = function(){
	this.engine.buttonDown = true;
};

webglRenderer.prototype.onmouseup = function(){
	this.engine.buttonDown = false;
};

webglRenderer.prototype.pick = function(mouse_pos, obj) {
    var ray = this.create_mouse_ray(mouse_pos);
    if (obj !== undefined) {
        return ray.intersectObject(obj);
    }
    else {
        return this.scene.intersect(ray);
    }
};

webglRenderer.prototype.create_mouse_ray = function(mouse_pos) {
    var projector = new THREE.Projector();
    var norm_pos = new THREE.Vector2((mouse_pos.x / window.innerWidth) * 2 - 1, -(mouse_pos.y / window.innerHeight) * 2 + 1);
    var mouse_3d = projector.unprojectVector(new THREE.Vector3(norm_pos.x, norm_pos.y, 1.0), this.camera);
    return new THREE.Ray(this.camera.position, mouse_3d.subSelf(this.camera.position).normalize());
};

webglRenderer.prototype.resize = function( event ) {
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();
	if(this.scene.reset){
		this.scene.reset();
	}
};

webglRenderer.prototype.createMaterial = function(color){
	return new THREE.MeshPhongMaterial( { 
		ambient: 0x060606, 
		color: colorsBinary[color], 
		shininess: 20, 
		shading: THREE.FlatShading 
	});
};

webglRenderer.prototype.setEntityMesh = function(e){
	var index = e.modelIndex || 0;
	e.meshCache = e.meshCache || {};
	if(e.mesh){
		this.scene.remove( e.mesh );
	}
	if(e.meshCache[e.modelIndex]){
		e.mesh = e.meshCache[e.modelIndex];
	}
	else {
		var geometry = e.geometry || this.geometries[index];
		e.meshCache[e.modelIndex] = e.mesh = new THREE.Mesh( 
			geometry,
			this.createMaterial(e.color)
		);
		e.mesh.gameMesh = true;
		e.mesh.gameColor = e.color;
		e.mesh.modelIndex = e.modelIndex;
		e.mesh.scale.set( this.modelScale, this.modelScale, this.modelScale );
		e.mesh.doubleSided = true;
	}
	this.scene.add( e.mesh );
};

webglRenderer.prototype.renderEntity = function(e){
	if(!e.mesh){
		this.setEntityMesh(e);
	}
	if(e.mesh && e.position){
		if(e.subEntities){
			for(var i = 0, l = e.subEntities.length; i < l; i++){
				this.renderEntity(e.subEntities[i]);
			}
		}
		if(e.mesh.modelIndex !== e.modelIndex){
			this.setEntityMesh(e);
		}
		if(e.mesh.gameColor !== e.color){
			e.mesh.materials[0] = this.createMaterial(e.color);
			e.mesh.gameColor = e.color;
		}
		e.mesh.position.x = (e.position.x - this.centerOffset.x) * this.gameScale ;
		e.mesh.position.y = (e.position.y - this.centerOffset.y) * -this.gameScale ;
		e.mesh.position.z = e.position.z || 0;
		e.mesh.rotation.y = Math.PI * (e.direction === 1 ? 1.5 : 0.5);
		e.mesh.lastFrameNumber = this.lastFrameNumber;
//		if(e.name === 'Player 1'){
//			this.camera.position.x = e.mesh.position.x;
//			this.camera.position.y = e.mesh.position.y;
//			//this.camera.lookAt({x:0, y: 0, z: 0});
//			this.camera.lookAt({x: e.mesh.position.x / 2, y: e.mesh.position.y / 2, z:0});
//		}
	}
	if(e.render){
		e.render();
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
	if(this.worldMouse){
		this.camera.position.x = this.worldMouse.x / 1;
		this.camera.position.y = this.worldMouse.y / 1;
		this.camera.lookAt({x: 0 , y: 0 , z: 0});
	}
	this.renderer.render( this.scene, this.camera );
	//this.composer.render();
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