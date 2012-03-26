soundManager.debugMode = false;
soundManager.url = '/resources/script/soundmanager/swf/';
soundManager.onready( function() {
	  window.audio = {
		volume				: engine.effectsVolume,
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
		getAudio			: function(id, url){
			var result = soundManager.createSound({id:id, url:url, volume: engine.effectsVolume});
			// In some cases it is just not going to work (e.g old IE without flash)
			// createSound will return false.
			if(!result){
				// For now we return a place holder object
				result = {
					play: function(){},
					setVolume: function(){}
				};
			}
			return result;
		}
	};

	audio.explosionAudio 	= audio.getAudio('explosion', 'resources/audio/effects/explosion.mp3');
	audio.appearAudio 		= audio.getAudio('appear', 'resources/audio/effects/appear.mp3');
	audio.changeColorAudio	= audio.getAudio('changecolor', 'resources/audio/effects/changecolor.mp3');
	audio.laserAudio 		= audio.getAudio('laserSound', 'resources/audio/effects/laser.mp3');
	
});




