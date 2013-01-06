define(function(){

    var draggable = {};

    draggable.make = function(control){
        var self = control;
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

    return draggable;

});