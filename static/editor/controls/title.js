(function(){

    var title = function(config, callback){
        config = config || {};
        config.parentEl = document.body;
        config = merge({
            cls: 'controlTitle',
            height: 16,
            dock: 'top',
            items: [config.title]
        }, config);
        panel.call(this, config, callback);
    };

    title.inheritsFrom(panel);

    control.registry.title = title;

}())
