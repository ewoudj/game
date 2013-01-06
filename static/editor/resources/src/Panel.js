define(['Control'], function(Control){
    var Panel = function(config, callback){
        callback = callback || function(){};
        config = config || {};
        config = merge({
            cls: 'controlPanel',
            controlValue: config.text,
            items: []
        }, config);
        if(config.topBar){
            config.items.unshift({
                controlType: 'Toolbar',
                name: 'topBar',
                dock: 'top',
                height: 23,
                items: config.topBar
            });
        }
        var self = this;
        if(config.title){
            var titleBarConfig = {
                cls: 'controlTitle' + (config.topBar ? ' togetherWithToolbar' : ''),
                name: 'titleBar',
                height: 16,
                dock: 'top',
                items: [
                    config.title, {
                        controlType: 'Button',
                        cls: 'controlToolButton',
                        hidden: !(config.closable),
                        listeners: {
                            'click': function(){
                                self.hide();
                            }
                        }
                    }]
            };
            config.items.unshift(titleBarConfig);
        }
        Control.call(this, config, function(err, constructorResult){
            self.resize();
            callback(err, self);
        });
    };

    Panel.inheritsFrom(Control);

    Panel.prototype.addItem = function(newItem, callback){
        var self = this;
        return Control.prototype.addItem.call(this, newItem, function(err, addedItem){
            self.resize();
            callback(err, addedItem);
        });
    }

    Panel.prototype.removeItem = function(itemToRemove, doNotDestroy){
        var result = Control.prototype.removeItem.call(this,itemToRemove, doNotDestroy);
        this.resize();
        return result;
    }

    Panel.prototype.getTitle = function(){
        return this.titleBar.items[0].getText();
    };

    Panel.prototype.setTitle = function(newTitle){
        this.titleBar.items[0].setText(newTitle);
    };

    Panel.prototype.resize = function(){
        if(this.items){
            var totalTop = 0;
            var totalLeft = 0;
            var totalRight = 0;
            var totalBottom = 0;
            var centerItem = null;
            var splitSize = 0;
            for(var i = 0, l = this.items.length; i < l; i++){
                var item = this.items[i];
                var dock = item.dock;
                if(dock === 'top'){
                    var e = item.el;
                    var s = e.style;
                    s.position = 'absolute';
                    s.display = 'block';
                    s.left = '0px';
                    s.right = '0px';
                    s.height = item.height + 'px';
                    s.top = totalTop + 'px';
                    totalTop += e.offsetHeight;
                    if(item.split){
                        totalTop += splitSize;
                    }
                    if(item.resize){
                        item.resize();
                    }
                }
                else if(item.dock === 'center'){
                    centerItem = item;
                }
            }
            for(var i = this.items.length - 1; i > -1; i--){
                var item = this.items[i];
                var dock = item.dock;
                if(dock === 'bottom'){
                    var e = item.el;
                    var s = e.style;
                    s.position = 'absolute';
                    s.display = 'block';
                    s.left = '0px';
                    s.right = '0px';
                    s.height = item.height + 'px';
                    s.bottom = totalBottom + 'px';
                    totalBottom += e.offsetHeight;
                    if(item.split){
                        totalBottom += splitSize;
                    }
                    if(item.resize){
                        item.resize();
                    }
                }
            }
            for(var i = 0, l = this.items.length; i < l; i++){
                var item = this.items[i];
                var dock = item.dock;
                if(dock === 'left' || dock === 'right'){
                    var e = item.el;
                    var s = e.style;
                    s.position = 'absolute';
                    s.display = 'block';
                    s.top = totalTop + 'px';
                    s.bottom = totalBottom + 'px';
                    s.width = item.width + 'px';
                    if(dock === 'left'){
                        s.left = totalLeft + 'px';
                        totalLeft += e.offsetWidth;
                        if(item.split){
                            totalLeft += splitSize;
                        }
                    }
                    else if(dock === 'right'){
                        s.right = totalRight + 'px';
                        totalRight += e.offsetWidth;
                        if(item.split){
                            totalRight += splitSize;
                        }
                    }
                    if(item.resize){
                        item.resize();
                    }
                }
            }
            if(!centerItem && this.items.length === 1 && !this.items[0].dock){
                centerItem = this.items[0];
            }
            if(centerItem){
                var e = centerItem.el;
                var s = e.style;
                s.position = 'absolute';
                s.display = 'block';
                s.top = totalTop + 'px';
                s.bottom = totalBottom + 'px';
                s.right = totalRight + 'px';
                s.left = totalLeft + 'px';
                if(centerItem.resize){
                    centerItem.resize();
                }
            }
        }
    }

    Control.registry.Panel = Panel;
    return Panel
});
