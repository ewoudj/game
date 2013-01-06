define(['lib/async', 'Observable', 'Resizable', 'Draggable', 'Editable', 'css!../css/control'],
    function(async, observable, resizable, draggable, editable){

    window.merge = window.merge || function(a, b){
        if (a && b) {
            for (var key in b) {
                a[key] = b[key];
            }
        }
        return a;
    };

    Function.prototype.inheritsFrom = Function.prototype.inheritsFrom || function( parentClassOrObject ){
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

    var Control = function(config, callback){
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
        observable.make(this);
        this.items = [];
        this.addItems(config.items || [], function(err){
            if(self.resizable){
                resizable.make(self);
            }
            if(self.draggable){
                draggable.make(self);
            };
            if(self.editable){
                editable.make(self);
            }
            callback(err, self);
            self.fire('initialized', self, true);
        });
        return this;
    }

    Control.registry = {};

    Control.prototype.createElement = function(){
        if(this.tag === 'fragment'){
            this.el = document.createDocumentFragment();
        }
        else if(!this.el){
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
        if(this.tag !== 'fragment' && this.el.parentNode == null){
            this.parentEl = this.parentEl || document.body;
            this.parentEl.appendChild(this.el);
        }
    }

    Control.promotableAttributes = {
        'href': true,
        'cls': true,
        'id': true,
        'src': true,
        'style': true,
        'tabindex': true
    };

    Control.prototype.promoteAttributes = function(){
        for(var s in Control.promotableAttributes){
            if(this[s]){
                if(!this.attributes){
                    this.attributes = {};
                }
                this.attributes[s] = this[s];
            }
        }
    };

    Control.prototype.removeAllItems = function(doNotDestroy){
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

    Control.prototype.removeItem = function(itemToRemove, doNotDestroy){
        var index = this.items.indexOf(itemToRemove);
        this.items.splice(index ,1);
        this.el.removeChild(itemToRemove.el);
        itemToRemove.parentControl = null;
        itemToRemove.parentEl = null;
        if(itemToRemove.destroy && !doNotDestroy){
            itemToRemove.destroy();
        }
    };

    Control.prototype.addItems = function(itemsToAdd, callback){
        var self = this;
        async.forEach(itemsToAdd|| [], function(item, iteratorCallback){
            self.addItem(item, function(err, newItem){
                iteratorCallback();
            });
        }, callback);
    };

    Control.prototype.addItem = function(itemConfig, callback){
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
            throw 'Error: Control.items cannot contain null values';
        }
        if(typeof itemConfig === 'string'){
            // Assume it is a text node
            var itemConfig = {
                controlType: 'Text',
                text: itemConfig
            };
        }
        itemConfig.parentControl = this;
        itemConfig.parentEl = this.el;
        if(itemConfig.controlType && getType(itemConfig) !== 'function' ){
            Control.create(itemConfig.controlType, itemConfig, handler);
        }
        else if(this.itemDefaultType){
            Control.create(this.itemDefaultType, itemConfig, handler);
        }
        else{
            new Control(itemConfig, handler);
        }
    };

    Control.create = function(type, config, callback){
        if(typeof type === 'function'){
            new type(config, callback);
        }
        else{
            require([type.replace('.','/')], function(requiredType){
                new Control.registry[type](config, callback);
            });
        }
    };

    Control.prototype.getClass = function(){
        return this.el.getAttribute('class') || '';
    };

    Control.prototype.setClass = function(cls){
        this.el.setAttribute('class', cls);
    };

    Control.prototype.hasClass = function(cls){
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

    Control.prototype.addClass = function(cls){
        if(!this.hasClass(cls)){
            this.setClass(this.getClass() + ' ' + cls);
        }
    };

    Control.prototype.removeClass = function(cls){
        var classes = this.getClass().split(' ');
        var newClasses = [];
        for(var i = 0, l = classes.length; i < l; i++){
            if(classes[i] !== cls){
                newClasses.push(classes[i]);
            }
        }
        this.setClass(newClasses.join(' '));
    };

    Control.prototype.show = function(){
        this.removeClass('controlHidden');
    };

    Control.prototype.focus = function(){
        // Cannot focus
    };

    Control.prototype.hide = function(){
        this.addClass('controlHidden');
        this.fire('hide');
    };

    Control.prototype.isHidden = function(){
        return this.hasClass('controlHidden');
    };

    Control.prototype.enable = function(){
        this.removeClass('controlDisabled');
    };

    Control.prototype.disable = function(){
        this.addClass('controlDisabled');
    };

    Control.prototype.isDisabled = function(){
        return this.hasClass('controlDisabled');
    };

    Control.prototype.isChildOf = function(ctrl){
        return ctrl.isAncestorOf(this);
    };

    Control.prototype.isAncestorOf = function(ctrl){
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

    Control.prototype.getRectangle = function(){
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
    Control.getId = function(){
        idCounter++;
        return 'id' + idCounter;
    };

    var stylesheet = null;
    var cssRules = null;

    Control.setCssSelector = function(selector, style) {
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

    return Control;
});