define(['Control', 'css!../css/separator'], function(Control){
    var Separator = function(config, callback){
        var orientation = Separator.orientation.vertical;
        config = config || {};
        if( config.parentControl &&
            config.parentControl.getSeparatorOrientation){
            orientation = config.parentControl.getSeparatorOrientation();
        }
        config = merge({
            cls: orientation ==  Separator.orientation.vertical ?
                'controlSeparatorVertical' : 'controlSeparatorHorizontal'
        }, config);
        Control.call(this, config, callback);
    };

    Separator.inheritsFrom(Control);

    Separator.orientation = {
        horizontal: 'horizontal',
        vertical: 'vertical'
    };

    Control.registry.Separator = Separator;
    return Separator;
});
