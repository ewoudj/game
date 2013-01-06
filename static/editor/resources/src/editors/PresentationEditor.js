define(['Control'], function(Control){

    // If the defines module is in a subdirectory (like dialogs), the loading of css
    // runs into a issue with require.js / css loading where the path is incorrectly constructed.
    // To bypass this issue we load the css as in the following line:
    require(['css!../css/PresentationEditor']);

    var PresentationEditor = function(config, callback){
        config = config || {};
        config = merge({
            items : [{
                style: {
                    width: '100%',
                    height: '100%',
                    border: '0px'
                },
                tag: 'iframe',
                name: 'iframe',
                src: 'about:blank'//'../lib/impressjs/empty.html'
            }]
        }, config);
        var self = this;
        Control.call(this, config, function(err, newEditor){
            self.clear(function(clearErr, clearItems){
                callback(null, newEditor);
            });
        });
    };

    PresentationEditor.inheritsFrom(Control);

//    PresentationEditor.prototype.resize = function(){
//        this.textEditor.resize();
//    };

    PresentationEditor.prototype.setValue = function(){

    };

    PresentationEditor.prototype.clear = function(callback){
        var self = this;
        this.iframe.src = 'about:blank';
        this.createHead(function(headErr, headControl){
            self.createBody(function(bodyErr, headControl){
                callback(null, this);
            });
        });
    };

    PresentationEditor.prototype.createHead = function(callback){
        var headEl = this.iframe.el.contentDocument.getElementsByTagName('head')[0];
        var headControl = new Control({
            el: headEl,
            items: [{
                tag: 'meta',
                attributes: {
                    name: 'viewport',
                    content:'width=1024'
                }
            },{
                tag: 'link',
                href: '../lib/impressjs/css/impress-demo.css',
                attributes: {rel:'stylesheet'}
            }, {
                tag: 'script',
                src: '../lib/impressjs/js/impress.js'
            }]
        }, callback);
    };

    PresentationEditor.prototype.createBody = function(callback){
        var self = this;
        var bodyEl = this.iframe.el.contentDocument.body;
        new Control({
            el: bodyEl,
            cls: 'impress-not-supported',
            items: [{
                cls: 'fallback-message',
                items: [{tag: 'p', items: ['Your browser is not good enough. Please download a proper browser.']}]
            }, {
                id: 'impress',
                name: 'rootEl',
                items: [{
                    cls: 'step slide',
                    attributes: {
                        'data-x': -1500,
                        'data-y': -1500
                    },
                    items: ['Step nr 1']
                }, {
                    cls: 'step slide',
                    attributes: {
                        'data-x': -0,
                        'data-y': -1500
                    },
                    items: ['Step nr 2']
                }]
            }, {
                cls: 'hint',
                items: [{tag: 'p', items: ['Use a spacebar or arrow keys to navigate.']}]
            }]
        }, function(err, bodyControl){
            self.iframe.el.contentWindow.onImpressReady = function(impress){
                impress().init();
                callback(err, bodyControl);
            };
        });
    };

    PresentationEditor.prototype.createNew = function(){
        var newPresentation = {
            name: 'New Presentation.presentation',
            steps : [{
                cls: 'step slide',
                attributes: {
                    'data-x': 1000,
                    'data-y': -1500
                },
                items: ['Content for your new slide']
            }]
        };
    };

    PresentationEditor.prototype.getImpress = function(){
        return this.iframe.el.contentWindow.impress();
    };

    PresentationEditor.prototype.addStep = function(callback){
        var impress = this.getImpress();
        var self = this;
        new Control({
            parentEl: impress.parent(),
            cls: 'step slide',
            attributes: {
                'data-x': 1000,
                'data-y': -1500,
                'data-z': 0,
                'data-rotate-x': 180,
                'data-rotate-y': 180,
                'data-rotate-z': 0
            },
            items: [{
                editable: true,
                items: ['Example text to edit']
            }]
        }, function(err, newStep){
            newStep.parentControl = self;
            impress.add(newStep.el);
            impress.goto(newStep.el);
            callback(null, newStep);
        });
    };

    PresentationEditor.prototype.setEditorFocus = function(focussedEditor){
        this.focussedEditor = focussedEditor;
    };

    PresentationEditor.prototype.removeStep = function(){
        var impress = this.getImpress();
        var currentStep = impress.current();
        impress.remove(currentStep);
    };

    PresentationEditor.prototype.getButtonConfig = function(){

        var self = this;

        var genericHandler = function(button){
            if(self.focussedEditor){
                self.iframe.el.contentDocument.execCommand(button.command, button.useDefaultUI || false, button.arguments || null);
                self.focussedEditor.el.focus();
            }
        };

        var newCmd = function(command, iconCls, text, tooltip){
            return {
                text: text,
                iconCls: iconCls,
                tooltip: tooltip,
                handler: genericHandler,
                command: command
            };
        };

        return [{
            iconCls: 'bAddStep',
            tooltip: 'Add a new step to the presentation',
            handler: function(){
                self.addStep(function(){})
            }
        }, {
            iconCls: 'bRemoveStep',
            tooltip: 'Remove the current step from the presentation',
            handler: function(){
                self.removeStep(function(){})
            }
        }, {
            controlType: 'Separator'
        },  newCmd('cut','bCut', null, 'Cut'),
            newCmd('copy','bCopy', null, 'Copy'),
            newCmd('paste','bPaste', null, 'Paste'),
            newCmd('undo','bUndo', null, 'Undo last action.'),
            newCmd('redo','bRedo', null, 'Undo last undo.'),
            newCmd('bold','bBold', null, 'Toggle bold.'),
            newCmd('italic','bItalic', null, 'Toggle italic'),
            newCmd('underline','bUnderline', null, 'Toggle underline'),
            newCmd('justifyLeft','bJustifyLeft', null, 'Align left.'),
            newCmd('justifyCenter','bJustifyCenter', null, 'Align center.'),
            newCmd('justifyFull','bJustifyFull', null, 'Justify.'),
            newCmd('justifyRight','bJustifyRight', null, 'Align right.'),
            newCmd('insertOrderedList','bOrderedList', null, 'Create numbered list.'),
            newCmd('insertUnorderedList','bUnorderedList', null, 'Create bulleted list.'),
            newCmd('indent','bIndent', null, 'Indent.'),
            newCmd('outdent','bOutdent', null, 'Remove indent.')];
    };

    Control.registry['editors.PresentationEditor'] = PresentationEditor;
    return PresentationEditor;
});
