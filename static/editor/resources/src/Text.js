define(['Control'], function(Control){

    var Text = function(config, callback){
        config.parentControl.texts = config.parentControl.texts || [];
        config.parentControl.texts.push(this);
        config = config || {};
        Control.call(this, config, callback);
    };

    Text.inheritsFrom(Control);

    Text.prototype.createElement = function(){
        this.el = document.createTextNode(this.text);
        this.parentEl.appendChild(this.el);
    }

    Text.prototype.setText = function(text){
        this.el.textContent = text;
    };

    Text.prototype.getText = function(text){
        return this.el.textContent;
    };

    Control.registry.Text = Text;

    return Text;

});