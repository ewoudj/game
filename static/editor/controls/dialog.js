(function(){

    var panel = control.registry.panel;

    var dialog = function(config, callback){
        config = config || {};
        config.parentEl = document.body;
        config = merge({
            hidden: true,
            cls: 'controlPanel controlDialog',
            items: [],
            draggable: true,
            dragElName: 'titleBar',
            resizable: true
        }, config);
        var self = this;
        panel.call(this, config, function(err, newItem){
            callback(err, newItem);
        });
    };

    dialog.inheritsFrom(panel);

    dialog.prototype.show = function(){
        panel.prototype.show.call(this);
        panel.prototype.resize.call(this);
    };

    control.registry.dialog = dialog;

}())
