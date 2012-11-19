(function(){
    var grid = function(config, callback){
        callback = callback || function(){};
        config = config || {};
        config = merge({
            cls: 'controlGrid',
            items: []
        }, config);
        config.items.push({
            cls: 'controlGridHeader',
            name: 'header',
            items: [{
                tag: 'table',
                
            }]
        });
        config.items.push({
            cls: 'controlGridBody',
            name: 'body'
        });
        var self = this;
        control.call(this, config, callback);
    };

    grid.inheritsFrom(control);

    control.registry.grid = grid;
}())
