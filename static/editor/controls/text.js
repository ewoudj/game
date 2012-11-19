(function(){
    var text = function(config, callback){
        config.parentControl.texts = config.parentControl.texts || [];
        config.parentControl.texts.push(this);
        config = config || {};
        control.call(this, config, callback);
    };

    text.inheritsFrom(control);

    text.prototype.createElement = function(){
        this.el = document.createTextNode(this.text);
        this.parentEl.appendChild(this.el);
    }

    text.prototype.setText = function(text){
        this.el.textContent = text;
    };

    text.prototype.getText = function(text){
        return this.el.textContent;
    };

    control.registry.text = text;
}())
