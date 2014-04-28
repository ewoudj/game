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
		},
        firstInput: false,
        afterInput: function(){
            // On iOS audio only becomes available after first user input
            // This method is called from canvas and webgl renders as UI events
            // originate there
            if(!audio.firstInput){
                audio.firstInput = true;
                var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
                if(iOS){
                    try {
                        audio.changeColorAudio.play();
                    } catch(e) {
                    }
                }
            }

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
        audioContext = new AudioContext();
        var result = {
            url: url,
            play: function(){},
            setVolume: function(){},
            init: function(){
                loadSound(result.url, audioContext, function(buffer){
                    result.play = function(){
                        playSound(audioContext, buffer);
                    };
                });
            }
        };
        result.init();
        return result;
    }

    audio.explosionAudio 	= initSound('resources/audio/effects/explosion.mp3');
    audio.appearAudio 		= initSound('resources/audio/effects/appear.mp3');
    audio.changeColorAudio	= initSound('resources/audio/effects/changecolor.mp3');
    audio.laserAudio 		= initSound('resources/audio/effects/laser.mp3');
})();