define(['Control', 'Separator', 'css!../css/toolbar'], function(Control){
    var Toolbar = function(config, callback){
        config = config || {};
        config = merge({
            cls: 'controlToolbar',
            itemDefaultType: 'Button'
        }, config);
        Control.call(this, config, callback);
    };

    Toolbar.inheritsFrom(Control);

    Toolbar.prototype.getSeparatorOrientation = function(){
        return Control.registry.Separator.orientation.vertical;
    };

    Control.registry.Toolbar = Toolbar;
    return Toolbar;
});
