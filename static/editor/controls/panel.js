(function(){
    var panel = function(config, callback){
        callback = callback || function(){};
        config = config || {};
        config = merge({
            cls: 'controlPanel',
            controlValue: config.text,
            items: []
        }, config);
        if(config.topBar){
            config.items.unshift({
                controlType: 'toolbar',
                name: 'topBar',
                dock: 'top',
                height: 23,
                items: config.topBar
            });
        }
        if(config.title){
            config.items.unshift({
                cls: 'controlTitle',
                name: 'titleBar',
                height: 16,
                dock: 'top',
                items: [config.title]
            });
        }
        var self = this;
        control.call(this, config, function(err, constructorResult){
            self.resize();
            callback(err, self);
        });
    };

    panel.inheritsFrom(control);

    panel.prototype.resize = function(){
        if(this.items){
            var totalTop = 0;//this.el.offsetTop;
            var totalLeft = 0;
            var totalRight = 0;
            var totalBottom = 0;
            var centerItem = null;
            var splitSize = 0;
            for(var i = 0, l = this.items.length; i < l; i++){
                var item = this.items[i];
                var dock = item.dock;
                if(dock === 'top' || dock === 'bottom'){
                    var e = item.el;
                    var s = e.style;
                    s.position = 'absolute';
                    s.display = 'block';
                    s.left = '0px';
                    s.right = '0px';
                    s.height = item.height + 'px';
                    if(dock === 'top'){
                        s.top = totalTop + 'px';
                        totalTop += e.offsetHeight;
                        if(item.split){
                            totalTop += splitSize;
                        }
                    }
                    else if(dock === 'bottom'){
                        s.bottom = totalBottom + 'px';
                        totalBottom += e.offsetHeight;
                        if(item.split){
                            totalBottom += splitSize;
                        }
                    }
                }
                else if(item.dock === 'center'){
                    centerItem = item;
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
            }
        }
    }

    control.registry.panel = panel;
}())
