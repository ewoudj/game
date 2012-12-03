(function(){

    var button = function(config, callback){

        var self = this;
        config = config || {};
        config = merge({
            cls: 'controlButton',
            items: []
        }, config);
        // Add the icon
        if(config.iconCls){
            config.cls += ' controlButtonIcon';
            config.items = config.items || [];
            config.items.push({
                name: 'icon',
                cls: 'controlButtonIconIcon ' + (config.text ? 'controlButtonText ' : '') + config.iconCls
            });
        }
        if(config.text){
            config.items.push(config.text);
        }
        // Adds an arrow
        if(config.menu && config.menu.length > 0){
            config.items = config.items || [];
            config.items.push({
                name: 'arrow',
                cls: 'controlButtonMenuIcon'
            });
            config.items.push({
                controlType: 'menu',
                name: 'menu',
                items: config.menu
            });
        }
        // If the button must right align on a parent (e.g.) the appropriate class is added.
        if(config.align === 'right'){
            config.cls += ' alignright';
        }

        control.call(this, config, function(err, newControl){
            self.el.addEventListener('click', mouseClickHandler, true);
            self.el.addEventListener('mousemove', mouseMoveHandler, true);
            callback(err, newControl);
        });

        function mouseClickHandler(e){
            var evt = e || window.event;
            if(!self.isDisabled()){
                self.fire('click', {});
                if(self.menu){
                    evt.cancelBubble = true;
                    // If the menu is from a button, clicking that button again toggles hidden state.
                    // For buttons on a menu, nothing happens.
                    if(!self.menu.isHidden() && !(self.parentControl instanceof control.registry.menu)){
                        self.menu.hide();
                    }
                    else{
                        self.menu.show();
                    }
                }
            }
        }

        function mouseMoveHandler(){
            var activeMenu = control.registry.menu.getActiveMenu();
            // If this button's parent is a menu and the current active menu is not the
            // button's menu, make sure any (peer) menu's are closed by asking the parent
            // menu to close them.
            if(self.parentControl instanceof control.registry.menu && activeMenu != self.menu){
                self.parentControl.hideSubMenus();
            }
            if(activeMenu && self.menu && activeMenu != self.menu){
                if(!activeMenu.isAncestorOf(self)){
                    activeMenu.hideAll(self.parentControl);
                }
                self.menu.show();
            }
        }
    };

    button.inheritsFrom(control);

    button.prototype.setText = function(text){
        if(this.texts && this.texts.length > 0){
            this.texts[0].setText(text);
        }
    };

    button.prototype.getText = function(text){
        if(this.texts && this.texts.length > 0){
            return this.texts[0].getText(text);
        }
    };

    control.registry.button = button;

}())
