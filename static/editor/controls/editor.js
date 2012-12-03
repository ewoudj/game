(function(){
    var editor = function(config, callback){
        config = config || {};
        config = merge({
            cls: 'controlEditor',
            controlValue: config.text,
            id: (Math.random() * Math.pow(2, 53)).toString()
        }, config);
        var self = this;
        control.call(this, config, function(err, self){
            self.textEditor = ace.edit(config.id);
            self.textEditor.setTheme("ace/theme/xcode");
            self.textEditor.getSession().setMode("ace/mode/javascript");
            callback(err, self);
        });
    };

    editor.inheritsFrom(control);

    control.registry.editor = editor;
}())
