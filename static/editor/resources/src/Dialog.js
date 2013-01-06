define(['Control', 'Panel', 'css!../css/dialog'], function(Control, Panel){

    var activeDialog = null;

    var Dialog = function(config, callback){
        config = config || {};
        config.parentEl = document.body;
        config = merge({
            hidden: true,
            cls: 'controlPanel controlDialog',
            items: [],
            draggable: true,
            dragElName: 'titleBar',
            resizable: true,
            maximizable: true,
            closable: true,
            minimizable: true,
            width: 500,
            height: 350
        }, config);
        config.style = config.style || {};
        config.style.width = config.width + 'px';
        config.style.height = config.height + 'px';
        if(config.buttons){
            var buttons = {
                dock: 'bottom',
                name: 'buttons',
                height: 24,
                cls: 'bottomPanel',
                items: []
            };
            for(var s in config.buttons){
                buttons.items.push({
                    controlType: 'Button',
                    text: s,
                    name: s,
                    align: 'right',
                    disabled: false,
                    listeners: {
                        'click': config.buttons[s]
                    }
                });
            }
            config.items.push(buttons);
        }
        var self = this;
        Panel.call(this, config, function(err, newItem){
            self.el.addEventListener('mousedown', function(){
                self.activate();
            });
            callback(err, newItem);
        });
    };

    Dialog.inheritsFrom(Panel);

    Dialog.prototype.activate = function(){
        if(activeDialog){
            activeDialog.removeClass('controlDialogActive');
        }
        activeDialog = this;
        this.addClass('controlDialogActive');
    };

    Dialog.prototype.show = function(){
        Panel.prototype.show.call(this);
        Panel.prototype.resize.call(this);
        this.activate();
    };

    Control.registry.Dialog = Dialog;
    return Dialog;
});
