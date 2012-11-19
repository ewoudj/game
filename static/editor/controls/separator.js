(function(){
    var separator = function(config, callback){
        var orientation = separator.orientation.vertical;
        config = config || {};
        if( config.parentControl &&
            config.parentControl.getSeparatorOrientation){
            orientation = config.parentControl.getSeparatorOrientation();
        }
        config = merge({
            cls: orientation ==  separator.orientation.vertical ?
                'controlSeparatorVertical' : 'controlSeparatorHorizontal'
        }, config);
        control.call(this, config, callback);
    };

    separator.inheritsFrom(control);

    separator.orientation = {
        horizontal: 'horizontal',
        vertical: 'vertical'
    };

    control.registry.separator = separator;
}())
