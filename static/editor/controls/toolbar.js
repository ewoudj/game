(function(){
    var toolbar = function(config, callback){
        config = config || {};
        config = merge({
            cls: 'controlToolbar',
            itemDefaultType: 'button'
        }, config);
        control.call(this, config, callback);
    };

    toolbar.inheritsFrom(control);

    toolbar.prototype.getSeparatorOrientation = function(){
        return control.registry.separator.orientation.vertical;
    };

    control.registry.toolbar = toolbar;
}())
