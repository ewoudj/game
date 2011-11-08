engine.settings = {
	initialize: function(){
		// TODO: remove try catch ugliness (currently there to keep it working on IE)
		try{
			var gui = new DAT.GUI({
				height : 7 * 32 - 1
			});
			DAT.GUI.toggleHide();
			DAT.GUI.supressHotKeys = true; // Disable the H key
			gui.add(engine, 'player1ai').options('heuristic', 'prioritizing').onChange(function(newValue) {
				engine.setItem('player1ai', newValue);
			});
			gui.add(engine, 'player2ai').options('heuristic', 'prioritizing').onChange(function(newValue) {
				engine.setItem('player2ai', newValue);
			});
			gui.add(engine, 'renderer').options('classic', 'webgl').onChange(function(newValue) {
				engine.setItem('renderer', newValue);
			});
			gui.add(engine, 'effectsVolume', 0, 100, 1).onChange(function(newValue) {
				engine.setItem('effectsVolume', newValue);
				window.audio.setVolume(newValue);
			});
			gui.add(engine, 'musicVolume', 0, 100, 1).onChange(function(newValue) {
				engine.setItem('musicVolume', newValue);
			});
			gui.add(engine, 'maxScore', 1, 99, 1).onChange(function(newValue) {
				engine.setItem('maxScore', newValue);
			});
			gui.add(engine, 'maxAiScore', 1, 99, 1).onChange(function(newValue) {
				engine.setItem('maxAiScore', newValue);
			});
		}
		catch(exception){
			// This should only happen on IE
		}
	}	
};