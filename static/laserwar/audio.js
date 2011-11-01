soundManager.debugMode = false;
soundManager.url = '/resources/script/soundmanager/swf/';
soundManager.onload = function() {
	  window.audio = {
		explosionAudio		: soundManager.createSound({id:'explosion', url:'/resources/audio/effects/explosion.mp3'}),
		appearAudio 		: soundManager.createSound({id:'appear', url:'/resources/audio/effects/appear.mp3'}),
		changeColorAudio 	: soundManager.createSound({id:'changecolor', url:'/resources/audio/effects/changecolor.mp3'}),
		laserAudio 			: soundManager.createSound({id:'laserSound', url:'/resources/audio/effects/laser.mp3'}),
		volume				: 100,
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
		}
	};
};
