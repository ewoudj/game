(function(){

    var panel = control.registry.panel;

    var activeDialog = null;

    var dialog = function(config, callback){
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
            minimizable: true
        }, config);
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
                    controlType: 'button',
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
        panel.call(this, config, function(err, newItem){
            self.el.addEventListener('mousedown', function(){
                self.activate();
            });
            callback(err, newItem);
        });
    };

    dialog.inheritsFrom(panel);

    dialog.prototype.activate = function(){
        if(activeDialog){
            activeDialog.removeClass('controlDialogActive');
        }
        activeDialog = this;
        this.addClass('controlDialogActive');
    };

    dialog.prototype.show = function(){
        panel.prototype.show.call(this);
        panel.prototype.resize.call(this);
        this.activate();
    };

    control.registry.dialog = dialog;

}())
