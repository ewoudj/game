define(function(){

    var editable = {};

    editable.make = function(control){
        var el = control.el;
        if(el){
            el.setAttribute('contenteditable',true);
        }
        el.addEventListener('focus', function(evt){
            var p = control.parentControl;
            var cancelBubble = false;
            while(p){
                if(cancelBubble = p.setEditorFocus){
                    p.setEditorFocus(control);
                }
                if(cancelBubble){
                    p = null;
                }
                else {
                    p = p.parentControl;
                }
            }
        });
        control.action = control.actions || {};
        control.action.toggleBold = {
            text: 'Bold',
            iconCls: 'bBold',
            title: 'Toggle bold'

        };
    };

    return editable;

});