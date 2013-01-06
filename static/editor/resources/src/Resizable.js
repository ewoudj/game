define(function(){

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

    var resizable = {};

    resizable.make = function(control){

        var self = control;

        var getStyleInt = function(property, defaultValue){
            var s = self.el.style[property];
            return s ? parseInt(s.substr(0, s.length - 2) ) : defaultValue;
        };

        var getHoverEdges = function(evt){
            var edgeWidth = 6;
            var r = self.getRectangle();
            var result = {
                top: (evt.clientY - r.top) < edgeWidth && self.resizeEdges.top,
                left: (evt.clientX - r.left) < edgeWidth && self.resizeEdges.left,
                bottom: evt.clientY > ((r.top + r.height) - edgeWidth) && self.resizeEdges.bottom,
                right: evt.clientX > ((r.left + r.width) - edgeWidth) && self.resizeEdges.right
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
            self.resizeEdge = getHoverEdges(evt).current;
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
                    var resizeEdge = getHoverEdges(evt).current;
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
                    var newHeight = getStyleInt( 'height', r.height ) + ( getStyleInt( 'top', r.top ) - newTop);
                    if(newHeight < (self.minHeight || 16)){
                        newHeight = (self.minHeight || 16);
                        newTop = getStyleInt( 'height', r.height ) + ( getStyleInt( 'top', r.top ) - newHeight);
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
                    var newWidth = getStyleInt( 'width', r.width ) + (getStyleInt( 'left', r.left ) - newLeft);
                    if(newWidth < (self.minWidth || 16)){
                        newWidth = (self.minWidth || 16);
                        newLeft = getStyleInt( 'width', r.width ) + (getStyleInt( 'left', r.left ) - newWidth);
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

    return resizable;

});