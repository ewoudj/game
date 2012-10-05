//soundManager.debugMode = false;
//soundManager.preferFlash = true;
//soundManager.useHTML5Audio = true;
//soundManager.url = 'resources/script/soundmanager/swf/';
//soundManager.onready( function() {
  window.audio = {
		//volume				: engine.effectsVolume,
		setVolume			: function(newVolume){
			audio.volume = newVolume;
			for(var s in audio){
				if(audio[s].setVolume){
					audio[s].setVolume(audio.volume);
				}
			}
		},
		decreaseVolume		: function(){
			if(audio.volume > 0){
				audio.volume -= 10;
			}
			audio.setVolume(audio.volume);
		},		
		increaseVolume		: function(){
			if(audio.volume < 100){
				audio.volume += 10;
			}
			audio.setVolume(audio.volume);
		},		
		mute				: function(){
			audio.volume = 0;
			audio.setVolume(audio.volume);
		},
		iOS					: function(){
			return (
					//(navigator.userAgent.match(/iPhone/i)) || 
					(navigator.userAgent.match(/iPod/i)) || 
					(navigator.userAgent.match(/iPad/i)) 
			);
		}//,
//		getAudio			: function(id, url){
//			var result = !audio.iOS() ? soundManager.createSound({id:id, url:url, volume: engine.effectsVolume}) : null;
//			// In some cases it is just not going to work (e.g old IE without flash)
//			// createSound will return false.
//			if(!result){
//				// For now we return a place holder object
//				result = {
//					play: function(){},
//					setVolume: function(){}
//				};
//			}
//			return result;
//		}
};

//	audio.explosionAudio 	= audio.getAudio('explosion', 'resources/audio/effects/explosion.mp3');
//	audio.appearAudio 		= audio.getAudio('appear', 'resources/audio/effects/appear.mp3');
//	audio.changeColorAudio	= audio.getAudio('changecolor', 'resources/audio/effects/changecolor.mp3');
//	audio.laserAudio 		= audio.getAudio('laserSound', 'resources/audio/effects/laser.mp3');
	
//});

var audioContext = new webkitAudioContext();

function loadSound(url, ctx, onSuccess, onError) {
    // init request
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer'; // <= here secret sauce!

    // function called once data is loaded
    request.onload = function(){
        // request.response === encoded... so decode it now
        ctx.decodeAudioData(request.response, function(buffer) {
            onSuccess && onSuccess(buffer);
	}, function(){
            onError && onError();
        });
    };

    request.send();	// Start the request
}

function playSound(ctx, buffer) {
    // create a 'bufferSource' node
    var source = ctx.createBufferSource();
    // setup the buffer
    source.buffer = buffer;
    // connect it to context destination
    source.connect(ctx.destination);
    // play immediatly
    source.noteOn(0);
}

function initSound(url){
	var result = {
		play: function(){},
		setVolume: function(){}
	};
	loadSound(url, audioContext, function(buffer){
		result.play = function(){
			playSound(audioContext, buffer);
		};
	});
	return result;
}

audio.explosionAudio 	= initSound('resources/audio/effects/explosion.mp3');
audio.appearAudio 		= initSound('resources/audio/effects/appear.mp3');
audio.changeColorAudio	= initSound('resources/audio/effects/changecolor.mp3');
audio.laserAudio 		= initSound('resources/audio/effects/laser.mp3');