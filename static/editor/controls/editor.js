(function(){
    var editor = function(config, callback){
        config = config || {};
        config = merge({
            cls: 'controlEditor',
            controlValue: config.text,
            id: (Math.random() * Math.pow(2, 53)).toString()
        }, config);
        control.call(this, config, function(err, self){
            var editor = ace.edit(config.id);
            editor.setTheme("ace/theme/xcode");
            editor.getSession().setMode("ace/mode/javascript");
            callback(err, self);
        });
    };

    editor.inheritsFrom(control);

    control.registry.editor = editor;
}())
