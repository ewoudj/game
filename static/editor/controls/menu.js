(function(){

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

    var menu = function(config, callback){
        config = config || {};
        config.parentEl = document.body;
        config = merge({
            hidden: true,
            itemDefaultType: 'button',
            cls: 'controlMenu'
        }, config);
        if(config.items){
            for(var i = 0, l = config.items.length; i < l; i++){
                if(config.items[i] === '-'){
                    config.items[i] = {
                        controlType: 'separator'
                    };
                }
            }
        }
        control.call(this, config, callback);
    };

    menu.inheritsFrom(control);

    menu.getActiveMenu = function(){
        return activeMenu;
    }

    menu.prototype.getSeparatorOrientation = function(){
        return control.registry.separator.orientation.horizontal;
    };

    menu.prototype.show = function(){
        activeMenu = this;
        control.prototype.show.call(this);
        this.parentControl.addClass('controlButtonSelected');
        if(this.isSubMenu()){
            this.alignHorizontally();
        }
        else {
            this.alignVertically();
        }
    };

    // Used by menu directly on a toolbar button
    menu.prototype.alignVertically = function(){
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
    menu.prototype.alignHorizontally = function(){
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

    menu.prototype.isSubMenu = function(){
        return (
            this.parentControl && // The first parent is a button
            this.parentControl.parentControl && // The second parent might be a menu again
            this.parentControl.parentControl.isMenu
        );
    };

    menu.prototype.isMenu = true;

    menu.prototype.getParentMenu = function(){
        var result = null;
        if(this.isSubMenu()){
            result = this.parentControl.parentControl;
        }
        return result;
    };

    menu.prototype.hide = function(){
        this.parentControl.removeClass('controlButtonSelected');
        this.hideSubMenus();
        if(activeMenu == this){
            activeMenu = null;
        }
        control.prototype.hide.call(this);
    };

    menu.prototype.hideSubMenus = function(){
        for(var i = 0, l = this.items.length; i < l; i++){
            var m = this.items[i];
            if(m.menu && !m.menu.isHidden()){
                m.menu.hide();
            }
        }
        activeMenu = this;
    };

    // Also hides any parent menus
    menu.prototype.hideAll = function(stopAtElement){
        var m = this;
        while(m && m != stopAtElement){
            m.hide();
            m = m.getParentMenu();
        }
    };

    control.registry.menu = menu;

}())
