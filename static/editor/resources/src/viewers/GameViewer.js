define(['Control'], function(Control){
    var GameViewer = function(config, callback){
        config = config || {};
        config = merge({
            cls: 'controlGame',
            items : [{
                tag: 'iframe',
                src: '../../../game.html'
            }]
        }, config);
        Control.call(this, config, callback);
    };

    GameViewer.inheritsFrom(Control);

    Control.registry.GameViewer = GameViewer;
    return GameViewer;
});