define(['Control', 'ace/ace'], function(Control, ace){
    var TextEditor = function(config, callback){
        config = config || {};
        config = merge({
            cls: 'controlEditor',
            id: (Math.random() * Math.pow(2, 53)).toString()
        }, config);
        var self = this;
        Control.call(this, config, function(err, self){
            self.textEditor = ace.edit(config.id);
            self.textEditor.setTheme('ace/theme/xcode');
            self.textEditor.getSession().setMode('ace/mode/javascript');
            callback(err, self);
        });
    };

    TextEditor.inheritsFrom(Control);

    TextEditor.prototype.resize = function(){
        this.textEditor.resize();
    };

    TextEditor.prototype.getValue = function(){
        return this.textEditor.getSession().getValue();
    };

    TextEditor.prototype.setValue = function(newValue){
        return this.textEditor.getSession().setValue(newValue);
    };

    TextEditor.prototype.focus = function(){
        this.textEditor.textInput.focus();
    };

    TextEditor.prototype.destroy = function(){
        this.textEditor.destroy();
    };

    Control.registry['editors.TextEditor'] = TextEditor;
    return TextEditor;
});
