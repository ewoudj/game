/*
 *   WebGL rendering
 */
engine.rendering.webgl = function(suspend){
	if(!this.webglRenderer){
		this.webglRenderer = true;
		var self = this;
		this.webglRenderer = new engine.rendering.webgl.webglRenderer({
			models: [
				'resources/models/ship.js', 
				'resources/models/star.js',
				'resources/models/ufo1.js',
				'resources/models/ufo2.js',
				'resources/models/ufo3.js',
				'resources/models/laser.js',
				'resources/models/cube.js'
	        ],
			centerOffset: {x: this.width / 2, y: this.height / 2},
			engine: this,
			callback: function(){
				self.rendererInitialized = true;
			}
		});
	}
	this.webglRenderer.suspend(suspend);
	if(!this.webglRenderer.suspended){
		if(this.rendererInitialized){
			// Render
			for(var i = 0, l = this.entities.length; i < l; i++){
				var e = this.entities[i];			
				this.webglRenderer.renderEntity(e);
			}
			this.webglRenderer.renderScene();
		}
	}
};

engine.rendering.webgl.webglRenderer = function(){
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
		this.context2d = this.canvas.getContext('2d');
	    document.body.appendChild( this.canvas );
		this.canvas.onmousedown = this.onmousedown.bind(this);
		this.canvas.onmouseup = this.onmouseup.bind(this);
	    window.onmousemove = this.onmousemove.bind(this);
	    window.onresize = this.resize.bind(this);
	    // the 'background', used for 'flickering' and getting mouse coordinates
	    this.backgroundPlane = new THREE.Mesh( 
			new THREE.PlaneGeometry(config.engine.width, config.engine.height),
			this.createMaterial(config.engine.canvasColor)
		);
	    this.backgroundPlane.gameColor = config.engine.canvasColor;
	    this.backgroundPlane.scale.set( this.gameScale, this.gameScale, this.gameScale );
	    this.backgroundPlane.position.z = -50;
	    this.scene.add(this.backgroundPlane);
		// Initial camera position and look at
		this.camera.position.z = 1100;
		this.camera.position.x = 0;
		this.camera.position.y = 0;
		this.camera.lookAt({x:0,y:0,z:0});
		this.scene.add( this.camera );
		//this.scene.add( new THREE.AmbientLight( 0x101010 ) );
		var directionalLight = new THREE.DirectionalLight( 0xc0c0c0 );
		directionalLight.position.x = 0;
		directionalLight.position.y = 0;
		directionalLight.position.z = 1000;
		directionalLight.position.normalize();
		this.scene.add( directionalLight );
		// this.scene.add( new THREE.PointLight( 0xffffff, 1 ) );
		this.spotlight = new THREE.SpotLight( 0xffffff, 1, 1000, true );
		this.spotlight.position.set( 0, 0, 500 );
		this.scene.add( this.spotlight );
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
	
	webglRenderer.prototype.suspend = function(suspend){
		if(this.suspended && !suspend){
			this.canvas.style.display = 'block';
		    window.onmousemove = this.onmousemove.bind(this);
		    window.onresize = this.resize.bind(this);
			this.resize();
		}
		else if(!this.suspended && suspend){
			this.canvas.style.display = 'none';
		}
		this.suspended = suspend;
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
	
	webglRenderer.prototype.notify = function(eventName, entities){
		for(var i = 0, l = entities.length; i < l; i++ ){
    		var mesh = entities[i].object;
    		if(mesh && mesh.gameEntity && mesh.gameEntity[eventName]){
    			mesh.gameEntity[eventName](mesh.gameEntity, entities[i]);
    		}
    		else if(entities[i][eventName]){
    			entities[i][eventName](entities[i], entities[i]);
    		}
    	}
	};
	
	webglRenderer.prototype.onmousemove = function(e){
		if(this.suspended) return;
		var mouse_pos = new THREE.Vector2(e.clientX, e.clientY);
		var ray = this.create_mouse_ray(mouse_pos);
		this.worldMouse = this.planeIntersect(ray, 'z', 0);
		if(!this.engine.touchController.touchable){
			this.engine.mousePosition = this.toGamePoint(this.worldMouse);
			this.engine.absoluteController = true;
		}
	    this.mouseEntities = ray.intersectObjects(this.scene.children);
	    var items = this.engine.entities;
	    for(var i = 0, l = items.length; i < l; i++){
	    	var item = items[i];
	    	if(item.mousePlane){
	    		item.mousePosition = this.toGamePoint(this.planeIntersect(ray, item.mousePlane, item.mousePlaneOffset || 0));
	    		this.mouseEntities.push(item);
	    	}
	    }
	    this.notify('onmousemove', this.mouseEntities);
	};
	
	webglRenderer.prototype.toGamePoint = function(point){
		return {
			x: Math.ceil((point.x / this.gameScale) + this.centerOffset.x),
			y: (this.engine.height - Math.ceil((point.y / this.gameScale) + this.centerOffset.y)),
			z: point.z
		};
	};
	
	webglRenderer.prototype.onmousedown = function(e){
		if(this.suspended) return;
		if(!this.engine.touchController.touchable){
			if(( e || window.event).button === 2){
				this.engine.rightButtonDown = true;
			}
			else{
				this.engine.buttonDown = true;
			}
		}
		this.notify('onmousedown', this.mouseEntities);
	};
	
	webglRenderer.prototype.onmouseup = function(e){
		if(this.suspended) return;
			if(!this.engine.touchController.touchable){
			if(( e || window.event).button === 2){
				this.engine.rightButtonDown = false;
			}
			else{
				this.engine.buttonDown = false;
			}
		}
		this.notify('onmouseup', this.mouseEntities);
	};
	
	webglRenderer.prototype.pick = function(mouse_pos, obj) {
	    var ray = this.create_mouse_ray(mouse_pos);
	    if (obj !== undefined) {
	        return ray.intersectObject(obj);
	    }
	    else {
	        // return this.scene.intersect(ray);
	    	return ray.intersectObjects(this.scene.objects);
	    }
	};
	
	webglRenderer.prototype.create_mouse_ray = function(mouse_pos) {
	    var projector = new THREE.Projector();
	    var norm_pos = new THREE.Vector2((mouse_pos.x / window.innerWidth) * 2 - 1, -(mouse_pos.y / window.innerHeight) * 2 + 1);
	    var mouse_3d = projector.unprojectVector(new THREE.Vector3(norm_pos.x, norm_pos.y, 1.0), this.camera);
	    return new THREE.Raycaster(this.camera.position, mouse_3d.sub(this.camera.position).normalize());
	};
	
	webglRenderer.prototype.planeIntersect = function(rayCaster, plane /* x, y z*/, planeOffset){
		// planeOffset = start[plane] + (vector[plane] * time)
		// -(vector[plane] * time) = start[plane] - planeOffset
		// vector[plane] * time = -start[plane] + planeOffset
		// time = (-start[plane] + planeOffset) / vector[plane]
		// time = (planeOffset - start[plane]) / vector[plane]
		var result = null;
		var start = rayCaster.ray.origin;
		var vector = rayCaster.ray.direction;
		if(vector[plane]){
			var time = (planeOffset - start[plane]) / vector[plane];
			result = {
				x: start.x + (vector.x * time),
				y: start.y + (vector.y * time),
				z: start.z + (vector.z * time)
			};
		}
		return result;
		// 250 = 10 + (5 * time)
		// -(5 * time) = 10 - 250
		// time = 48
	};
	
	webglRenderer.prototype.resize = function( event ) {
		//if(this.suspended) return;
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		if(this.scene.reset){
			this.scene.reset();
		}
	};
	
	webglRenderer.prototype.createMaterial = function(color){
		return new THREE.MeshPhongMaterial( { 
			//ambient: 0x060606, 
			color: colorsBinary[color], 
			shininess: 20, 
			shading: THREE.FlatShading 
		});
	};
	
	webglRenderer.prototype.processTexts = function(e){
		if(e.texts){
			for(var i = 0, l = e.texts.length; i < l; i++ ){
				var t = e.texts[i];
				var text = t.text;
				if(!t.entity){
					t.entity = helpers.apply(t ,{
						text : text,
						modelIndex: text,
						score: 0,
						geometry: this.to3dText( text ),
						modelScale: 1,
						color: t.color,
						position: { 
							x: t.position.x || 0, 
							y: t.position.y || 0,
							z: t.position.z || 0
						},
						rotation: {
							x: 0, y:0, z:0
						},
						direction: -1
					});
					if(!e.subEntities){
						e.subEntities = [];
					}
					e.subEntities.push(t.entity);
				}
				if(t.entity.text != text){
					t.entity.text = text;
					t.entity.mesh = null;
					t.entity.modelIndex = text;
					t.entity.geometry = this.to3dText( text );
				}
				t.entity.color = t.color;
			}
		}
	};
	
	webglRenderer.prototype.to3dText = function(text){
		var result = null;
		if(this.engine.mode == 'standalone' || this.engine.mode == 'client'){
			result = (text === '') ? new THREE.Geometry() : new THREE.TextGeometry( text, {
				size: 90,
				height: 30,
				curveSegments: 1,
				font: "cbm-64"
			});
		}
		return result;
	};
	
	webglRenderer.prototype.setEntityMesh = function(e){
		var index = e.modelIndex || 0;
		var scale = e.modelScale || this.modelScale;
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
			e.mesh.gameEntity = e;
			e.mesh.gameMesh = true;
			e.mesh.gameColor = e.color;
			e.mesh.modelIndex = e.modelIndex;
			e.mesh.scale.set( scale, scale, scale );
			e.mesh.doubleSided = true;
		}
		this.scene.add( e.mesh );
	};
	
	webglRenderer.prototype.renderEntity = function(e){
		if(this.suspended) return;
		if(!e.mesh){
			this.setEntityMesh(e);
		}
		if(e.mesh && e.position){
			if(e.mesh.modelIndex !== e.modelIndex){
				this.setEntityMesh(e);
			}
			if(e.mesh.gameColor !== e.color){
				e.mesh.material = this.createMaterial(e.color);
				e.mesh.gameColor = e.color;
			}
			e.mesh.position.x = (e.position.x - this.centerOffset.x) * this.gameScale ;
			e.mesh.position.y = (e.position.y - this.centerOffset.y) * -this.gameScale ;
			e.mesh.position.z = e.position.z || 0;
			if(e.rotation){
				e.mesh.rotation.x = e.rotation.x;
				e.mesh.rotation.y = e.rotation.y;
				e.mesh.rotation.z = e.rotation.z;
			}
			else{
				e.mesh.rotation.y = Math.PI * (e.direction === 1 ? 1.5 : 0.5);
			}
			e.mesh.lastFrameNumber = this.lastFrameNumber;
		}
		this.processTexts(e);
		if(e.subEntities){
			var unfinishedEntities = [];
			for(var i = 0, l = e.subEntities.length; i < l; i++){
				if(!e.subEntities[i].finished){
					unfinishedEntities.push(e.subEntities[i]);
					this.renderEntity(e.subEntities[i]);
				}
			}
			e.subEntities = unfinishedEntities;
		}
		if(e.render){
			e.render();
		}
	};
	
	webglRenderer.prototype.renderScene = function(){
		if(this.suspended) return;
	    if(this.backgroundPlane.gameColor !== this.engine.canvasColor){
	    	this.backgroundPlane.materials[0] = this.createMaterial(this.engine.canvasColor);
	    	this.backgroundPlane.gameColor = this.engine.canvasColor;
		}
		var children = this.scene.children.slice(0);
		for(var i = 0, l = children.length; i < l; i++){
			var m = children[i];
			if(m.gameMesh && m.lastFrameNumber !== this.lastFrameNumber){
				this.scene.remove(m);
			}
		}
		if(this.worldMouse){
			this.camera.position.x = this.worldMouse.x;
			this.camera.position.y = this.worldMouse.y;
			this.camera.lookAt({x: 0 , y: 0 , z: 0});
			this.spotlight.position.x = this.worldMouse.x / 2;
			this.spotlight.position.y = this.worldMouse.y / 2;
			this.spotlight.lookAt({x: 0 , y: 0 , z: 0});
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
//			this.loader.load( { 
//				model: m, 
//				callback: function( geometry ) { 
//					self.geometries.push( geometry );
//					self.loadNextModel(models, callback);
//				}
//			});
			this.loader.load( m, function( geometry ) { 
				self.geometries.push( geometry );
				self.loadNextModel(models, callback);
			});
		}
	};
	
	return webglRenderer;
}();