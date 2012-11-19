(function(){
    var game = function(config, callback){
        config = config || {};
        config = merge({
            cls: 'controlGame',
            items : [{
                tag: 'iframe',
                src: '../game.html'
            }]
        }, config);
        control.call(this, config, callback);
    };

    game.inheritsFrom(control);

    control.registry.game = game;
}())
