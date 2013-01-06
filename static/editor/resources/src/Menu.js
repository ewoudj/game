define(['Control', 'Separator', 'css!../css/menu'], function(Control){

    var activeMenu = null;

    window.document.addEventListener('click', function(evt){
        if(activeMenu){
            if(evt.target == activeMenu.parentControl.el || evt.target == activeMenu.el  ){
            }
            else{
                activeMenu.hideAll();
            }
        }
    });

    var Menu = function(config, callback){
        config = config || {};
        config.parentEl = document.body;
        config = merge({
            hidden: true,
            itemDefaultType: 'Button',
            cls: 'controlMenu'
        }, config);
        if(config.items){
            for(var i = 0, l = config.items.length; i < l; i++){
                if(config.items[i] === '-'){
                    config.items[i] = {
                        controlType: 'Separator'
                    };
                }
            }
        }
        Control.call(this, config, callback);
    };

    Menu.inheritsFrom(Control);

    Menu.getActiveMenu = function(){
        return activeMenu;
    }

    Menu.prototype.getSeparatorOrientation = function(){
        return Control.registry.Separator.orientation.horizontal;
    };

    Menu.prototype.show = function(){
        activeMenu = this;
        Control.prototype.show.call(this);
        this.parentControl.addClass('controlButtonSelected');
        if(this.isSubMenu()){
            this.alignHorizontally();
        }
        else {
            this.alignVertically();
        }
    };

    // Used by menu directly on a toolbar button
    Menu.prototype.alignVertically = function(){
        var r = this.parentControl.getRectangle(),
            left = r.left,
            top = r.top + r.height,
            e = this.el,
            b = document.body;
        if(left + e.offsetWidth > b.offsetWidth){
            left = (r.left + r.width) - e.offsetWidth;
        }
        if(top + e.offsetHeight > b.offsetHeight){
            top = r.top - e.offsetHeight;
        }
        e.style.top = top + 'px';
        e.style.left = left + 'px';
    };

    // Used by submenus
    Menu.prototype.alignHorizontally = function(){
        var menuEl = this.parentControl.parentControl.el,
            r = this.parentControl.getRectangle(),
            left = r.left + menuEl.offsetWidth,
            top = r.top,
            e = this.el,
            b = document.body;
        // Correct the offset so the menu's nicely align the first button
        if(this.items && this.items.length > 0){
            top -= this.items[0].el.offsetTop;
        }
        if(left + e.offsetWidth > b.offsetWidth){
            left = r.left - e.offsetWidth;
            // Take of half the border width, this makes the menu's overlap one border
            left += Math.ceil((menuEl.offsetWidth - menuEl.clientWidth) / 2);
        }
        else{
            // Take of half the border width, this makes the menu's overlap one border
            left -= Math.ceil((menuEl.offsetWidth - menuEl.clientWidth) / 2);
        }
        if(top + e.offsetHeight > b.offsetHeight){
            top = (b.offsetHeight - e.offsetHeight);
        }
        e.style.top = top + 'px';
        e.style.left = left + 'px';
    };

    Menu.prototype.isSubMenu = function(){
        return (
            this.parentControl && // The first parent is a button
                this.parentControl.parentControl && // The second parent might be a menu again
                this.parentControl.parentControl.isMenu
            );
    };

    Menu.prototype.isMenu = true;

    Menu.prototype.getParentMenu = function(){
        var result = null;
        if(this.isSubMenu()){
            result = this.parentControl.parentControl;
        }
        return result;
    };

    Menu.prototype.hide = function(){
        this.parentControl.removeClass('controlButtonSelected');
        this.hideSubMenus();
        if(activeMenu == this){
            activeMenu = null;
        }
        Control.prototype.hide.call(this);
    };

    Menu.prototype.hideSubMenus = function(){
        for(var i = 0, l = this.items.length; i < l; i++){
            var m = this.items[i];
            if(m.menu && m.menu.isHidden && !m.menu.isHidden()){
                m.menu.hide();
            }
        }
        activeMenu = this;
    };

    // Also hides any parent menus
    Menu.prototype.hideAll = function(stopAtElement){
        var m = this;
        while(m && m != stopAtElement){
            m.hide();
            m = m.getParentMenu();
        }
    };

    Control.registry.Menu = Menu;
    return Menu;
});
