(function(){

    var merge = function(a, b){
        if (a && b) {
            for (var key in b) {
                a[key] = b[key];
            }
        }
        return a;
    };

    Function.prototype.inheritsFrom = function( parentClassOrObject ){
        if ( parentClassOrObject.constructor == Function ) {
            //Normal Inheritance
            var tmp = function(){};
            tmp.prototype = parentClassOrObject.prototype;
            this.prototype = new tmp;//new parentClassOrObject;
            this.prototype.constructor = this;
            this.prototype.baseClass = parentClassOrObject.prototype;
        }
        else {
            //Pure Virtual Inheritance
            this.prototype = parentClassOrObject;
            this.prototype.constructor = this;
            this.prototype.baseClass = parentClassOrObject;
        }
        return this;
    };

    var control = function(config, callback){
        var self = this;
        var s;
        config = config || {};
        callback = callback || function(){};
        if(config.hidden){
            config.cls = config.cls || '';
            config.cls += ' controlHidden';
        }
        if(config.disabled){
            config.cls = config.cls || '';
            config.cls += ' controlDisabled';
        }
        merge(this, config);
        this.createElement();
        if(this.listeners){
            for(s in this.listeners){
                this.on(s, this.listeners[s]);
            }
        }
        this.items = [];
        async.forEach(config.items || [], function(item, iteratorCallback){
            self.addItem(item, function(err, newItem){
                iteratorCallback();
            });
        }, function(err){
            if(self.resizable){
                self.makeResizable();
            }
            if(self.draggable){
                self.makeDraggable();
            }
            callback(err, self);
        });
        return this;
    }

    control.registry = {};

    control.prototype.createElement = function(){
        if(this.tag === 'fragment'){
            this.el = document.createDocumentFragment();
        }
        else {
            this.el = document.createElement(this.tag || 'div');
        }
        this.promoteAttributes();
        if(this.attributes){
            for(var attributeName in this.attributes){
                if(this.attributes[attributeName] != null){
                    var attributeValue = this.attributes[attributeName];
                    if(attributeName == 'style' && typeof attributeValue !== 'string'){
                        for(var styleAttribute in attributeValue){
                            this.el.style[styleAttribute] = attributeValue[styleAttribute];
                        }
                    }
                    else{
                        attributeValue = attributeValue.toString();
                        if(attributeValue){
                            this.el.setAttribute(attributeName === 'cls' ? 'class' : attributeName, attributeValue);
                        }
                    }
                }
            }
        }
        if(this.tag !== 'fragment'){
            this.parentEl.appendChild(this.el);
        }
    }

    control.promotableAttributes = {
        'href': true,
        'cls': true,
        'id': true,
        'src': true,
        'style': true
    };

    control.prototype.promoteAttributes = function(){
        for(var s in control.promotableAttributes){
            if(this[s]){
                if(!this.attributes){
                    this.attributes = {};
                }
                this.attributes[s] = this[s];
            }
        }
    };

    control.prototype.removeAllItems = function(doNotDestroy){
        for(var i = 0, l = this.items.length; i < l; i++){
            var item = this.items[i];
            item.parentControl = null;
            item.parentEl = null;
            if(item.destroy && !doNotDestroy){
                item.destroy();
            }
        }
        this.items = [];
        this.el.innerHTML = '';
    };

    control.prototype.removeItem = function(itemToRemove, doNotDestroy){
        var index = this.items.indexOf(itemToRemove);
        this.items.splice(index ,1);
        this.el.removeChild(itemToRemove.el);
        itemToRemove.parentControl = null;
        itemToRemove.parentEl = null;
        if(itemToRemove.destroy && !doNotDestroy){
            itemToRemove.destroy();
        }
    };

    control.prototype.addItem = function(itemConfig, callback){
        var self = this;
        var handler = function(err, newItem){
            self.items.push(newItem);
            if(newItem.name){
                self[newItem.name] = newItem;
            }
            if(callback){
                callback(err, newItem);
            }
        }
        if(!itemConfig && itemConfig !== ''){
            throw 'Error: control.items cannot contain null values';
        }
        if(typeof itemConfig === 'string'){
            // Assume it is a text node
            var itemConfig = {
                controlType: 'text',
                text: itemConfig
            };
        }
        itemConfig.parentControl = this;
        itemConfig.parentEl = this.el;
        if(itemConfig.controlType && getType(itemConfig) !== 'function' ){
            control.create(itemConfig.controlType, itemConfig, handler);
        }
        else if(this.itemDefaultType){
            control.create(this.itemDefaultType, itemConfig, handler);
        }
        else{
            new control(itemConfig, handler);
        }
    };

    control.create = function(type, config, callback){
        new control.registry[type](config, callback);
    };

    control.prototype.on = function(eventName, handler){
        if(!this.observers){
            this.observers = {};
        }
        if(!this.observers[eventName]){
            this.observers[eventName] = [];
        }
        this.observers[eventName].push(handler);
    };

    control.prototype.fire = function(eventName, eventData){
        if(this.observers && this.observers[eventName]){
            var observers = this.observers[eventName];
            for(var i = 0; i < observers.length; i++){
                observers[i](this, eventName, eventData);
            }
        }
    };

    control.prototype.getClass = function(){
        return this.el.getAttribute('class') || '';
    };

    control.prototype.setClass = function(cls){
        this.el.setAttribute('class', cls);
    };

    control.prototype.hasClass = function(cls){
        var classes = this.getClass().split(' ');
        var result = false;
        for(var i = 0, l = classes.length; i < l; i++){
            if(classes[i] === cls){
                result = true;
                break;
            }
        }
        return result;
    };

    control.prototype.addClass = function(cls){
        if(!this.hasClass(cls)){
            this.setClass(this.getClass() + ' ' + cls);
        }
    };

    control.prototype.removeClass = function(cls){
        var classes = this.getClass().split(' ');
        var newClasses = [];
        for(var i = 0, l = classes.length; i < l; i++){
            if(classes[i] !== cls){
                newClasses.push(classes[i]);
            }
        }
        this.setClass(newClasses.join(' '));
    };

    control.prototype.show = function(){
        this.removeClass('controlHidden');
    };

    control.prototype.hide = function(){
        this.addClass('controlHidden');
        this.fire('hide');
    };

    control.prototype.isHidden = function(){
        return this.hasClass('controlHidden');
    };

    control.prototype.enable = function(){
        this.removeClass('controlDisabled');
    };

    control.prototype.disable = function(){
        this.addClass('controlDisabled');
    };

    control.prototype.isDisabled = function(){
        return this.hasClass('controlDisabled');
    };

    control.prototype.isChildOf = function(ctrl){
        return ctrl.isAncestorOf(this);
    };

    control.prototype.isAncestorOf = function(ctrl){
        var result = false;
        var p = ctrl.parentControl;
        while(p){
            if(p === this){
                result = true;
                p = null;
            }
            else {
                p = p.parentControl;
            }
        }
        return result;
    };

    control.prototype.makeDraggable = function(){
        var self = this;
        self.draggable = true;
        self.dragEl = self.dragEl || ((self.dragElName ? self[self.dragElName] : null) || self).el;
        self.dragEl.addEventListener('mousedown',function(e){
            var evt = window.event || e;
            self.dragOffset = {
                top: self.el.offsetTop - evt.clientY,
                left: self.el.offsetLeft - evt.clientX
            };
            self.dragging = true;
        }, false);
        document.body.addEventListener('mouseup',function(e){
            self.dragging = false;
        }, false);
        document.body.addEventListener('mousemove',function(e){
            if(self.dragging && !self.resizing){
                var evt = window.event || e;
                self.el.style.top = (evt.clientY + self.dragOffset.top) + 'px';
                self.el.style.left = (evt.clientX + self.dragOffset.left) + 'px';
            }
        }, false);
    };

    control.prototype.getStyleInt = function(property, defaultValue){
        var s = this.el.style[property];
        return s ? parseInt(s.substr(0, s.length - 2) ) : defaultValue;
    };

    control.prototype.makeResizable = function(){
        var self = this;
        var dock = self.dock;
        self.resizable = true;
        self.resizeEdges = self.resizeEdges || {
            top: dock ? (dock == 'bottom') : true,
            left: dock ? (dock == 'right') : true,
            bottom: dock ? (dock == 'top') : true,
            right: dock ? (dock == 'left') : true
        };
        self.el.addEventListener('mousedown',function(e){
            var evt = window.event || e;
            self.resizeEdge = self.getHoverEdges(evt).current;
            if(self.resizeEdge){
                var r = self.getRectangle();
                self.resizeOffset = {
                    top:r.top - evt.clientY,
                    left:r.left - evt.clientX,
                    bottom: (r.top + r.height) - evt.clientY,
                    right: (r.left + r.width) - evt.clientX
                };
                self.resizing = true;
            }
        }, false);
        document.body.addEventListener('mouseup',function(e){
            self.resizing = false;
        }, false);
        self.el.addEventListener('mousemove',function(e){
            if(!self.resizing){
                var evt = window.event || e;
                if(evt.currentTarget == self.el){
                    var resizeEdge = self.getHoverEdges(evt).current;
                    if(resizeEdge){
                        self.el.style.cursor = cursorLookup[resizeEdge];
                    }
                    else{
                        self.el.style.cursor = 'default';
                    }
                }
                else{
                    self.el.style.cursor = 'default';
                }
            }
        }, false);
        document.body.addEventListener('mousemove',function(e){
            if(self.resizing){
                var evt = window.event || e;
                var r = self.getRectangle();
                if(self.resizeEdge == 'top' || self.resizeEdge == 'topLeft' || self.resizeEdge == 'topRight'){
                    var newTop = evt.clientY - self.resizeOffset.top;
                    var newHeight = self.getStyleInt( 'height', r.height ) + (  self.getStyleInt( 'top', r.top ) - newTop);
                    if(newHeight < (self.minHeight || 16)){
                        newHeight = (self.minHeight || 16);
                        newTop = self.getStyleInt( 'height', r.height ) + (  self.getStyleInt( 'top', r.top ) - newHeight);
                    }
                    if(!self.dock){
                        self.el.style.top = newTop + 'px';
                    }
                    self.el.style.height = newHeight + 'px';
                    self.height = newHeight;
                }
                else if(self.resizeEdge == 'bottom' || self.resizeEdge == 'bottomLeft' || self.resizeEdge == 'bottomRight'){
                    var newHeight = (evt.clientY  ) - r.top;
                    if(newHeight < (self.minHeight || 16)){
                        newHeight = (self.minHeight || 16);
                    }
                    self.el.style.height = newHeight  + 'px';
                    self.height = newHeight;
                }
                if(self.resizeEdge == 'right' || self.resizeEdge == 'topRight' || self.resizeEdge == 'bottomRight'){
                    var newWidth = (evt.clientX - self.resizeOffset.right ) - r.left;
                    if(newWidth < (self.minWidth || 16)){
                        newWidth = (self.minWidth || 16);
                    }
                    self.el.style.width = newWidth + 'px';
                    self.width = newWidth;
                }
                else if(self.resizeEdge == 'left' || self.resizeEdge == 'topLeft' || self.resizeEdge == 'bottomLeft'){
                    var newLeft = evt.clientX - self.resizeOffset.left;
                    var newWidth = self.getStyleInt( 'width', r.width ) + (self.getStyleInt( 'left', r.left ) - newLeft);
                    if(newWidth < (self.minWidth || 16)){
                        newWidth = (self.minWidth || 16);
                        newLeft = self.getStyleInt( 'width', r.width ) + (self.getStyleInt( 'left', r.left ) - newWidth);
                    }
                    if(!self.dock){
                        self.el.style.left = newLeft + 'px';
                    }
                    self.el.style.width = newWidth + 'px';
                    self.width = newWidth;
                }
                if(self.dock){
                    self.parentControl.resize();
                }
                else if (self.resize){
                    self.resize();
                }
            }
        }, false);
    };

    var cursorLookup = {
        top: 'n-resize',
        left: 'w-resize',
        bottom: 's-resize',
        right: 'e-resize',
        topLeft: 'nw-resize',
        topRight: 'ne-resize',
        bottomLeft: 'sw-resize',
        bottomRight: 'se-resize'
    };

    control.prototype.getHoverEdges = function(evt){
        var edgeWidth = 6;
        var r = this.getRectangle();
        var result = {
            top: (evt.clientY - r.top) < edgeWidth && this.resizeEdges.top,
            left: (evt.clientX - r.left) < edgeWidth && this.resizeEdges.left,
            bottom: evt.clientY > ((r.top + r.height) - edgeWidth) && this.resizeEdges.bottom,
            right: evt.clientX > ((r.left + r.width) - edgeWidth) && this.resizeEdges.right
        };
        result.topLeft = result.top && result.left;
        result.topRight = result.top && result.right;
        result.bottomLeft = result.bottom && result.left;
        result.bottomRight = result.bottom && result.right;
        for(var s in result){
            if(result[s]){
                result.current = s;
            }
        }
        return result;
    };

    control.prototype.getStyleRectangle = function(){
        return {
            left: this.getStyleInt('left', this.el.offsetLeft),
            top: this.getStyleInt('top', this.el.offsetTop),
            width: this.getStyleInt('width', this.el.offsetWidth),
            height: this.getStyleInt('height', this.el.offsetHeight)
        };
    };

    control.prototype.getRectangle = function(){
        var left = 0
        var top = 0;
        var e = this.el;
        if (e.offsetParent) {
            do {
                left += e.offsetLeft;
                top += e.offsetTop;
            } while (e = e.offsetParent);
        }
        return {
            left: left,
            top: top,
            width: this.el.offsetWidth,
            height: this.el.offsetHeight
        };
    };

    var idCounter = 0;
    control.getId = function(){
        idCounter++;
        return 'id' + idCounter;
    };

    var stylesheet = null;
    var cssRules = null;

    control.setCssSelector = function(selector, style) {
        if (!cssRules) {
            var el = document.createElement('style'),
                sheets = document.styleSheets,
                i = 0;
            el.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(el);
            for (i = 0; i < sheets.length; i++) {
                if (sheets[i].disabled) {
                    continue;
                }
                stylesheet = sheets[i];
                cssRules = stylesheet.cssRules;
            }
        }
        var found = false;
        for(var i = 0, l = cssRules.length; i < l; i++){
            if(cssRules[i].selectorText == selector){
                cssRules[i].style.cssText = style;
                found = true;
                break;
            }
        }
        if(!found){
            stylesheet.insertRule(selector + '{' + style + '}', 0);
        }
    }

    function getType(v) {
        if (typeof(v) == 'object') {
            if (v === null) return 'null';
            if (v.constructor == (new Array).constructor) return 'array';
            if (v.constructor == (new Date).constructor) return 'date';
            if (v.constructor == (new RegExp).constructor) return 'regex';
            return 'object';
        }
        return typeof(v);
    }

    window.control = control;
    window.merge = merge;

}());