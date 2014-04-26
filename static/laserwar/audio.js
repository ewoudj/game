  window.audio = {
		setVolume: function(newVolume){
			audio.volume = newVolume;
			for(var s in audio){
				if(audio[s].setVolume){
					audio[s].setVolume(audio.volume);
				}
			}
		},
		decreaseVolume: function(){
			if(audio.volume > 0){
				audio.volume -= 10;
			}
			audio.setVolume(audio.volume);
		},		
		increaseVolume: function(){
			if(audio.volume < 100){
				audio.volume += 10;
			}
			audio.setVolume(audio.volume);
		},		
		mute: function(){
			audio.volume = 0;
			audio.setVolume(audio.volume);
		}
};

(function(){
    if (!window.AudioContext) {
        window.AudioContext = window.webkitAudioContext;
    }
    var audioContext = new AudioContext();

    function loadSound(url, ctx, onSuccess, onError) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer'; // Important trick
        request.onload = function(){
            ctx.decodeAudioData(
                request.response,
                function(buffer) {
                    onSuccess && onSuccess(buffer);
                },
                function(){
                    onError && onError();
                }
            );
        };
        request.send();
    }

    function playSound(ctx, buffer) {
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
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
})();