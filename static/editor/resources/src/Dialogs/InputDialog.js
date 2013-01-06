define(['../Control', , 'css!../css/InputDialog'], function(Control){

    var dialog = null;

    var InputDialog = function(config,callback){
        if(!dialog){
            Control.create('Dialog', {
                title: config.title || "Please enter the required input",
                width: config.width || 350,
                height: config.height || 200,
                resizable: false,
                listeners:{
                    'hide': function(){
                        if(dialog.requestCallback){
                            if(dialog.result === 'OK'){
                                dialog.requestCallback(null, dialog.selectedItem);
                            }
                            else{
                                dialog.requestCallback(null, null);
                            }
                        }
                    }
                },
                items: [{
                    dock: 'center',
                    cls: 'controlInputDialogItem',
                    items: ['Description of the required input']
                }, {
                    dock: 'bottom',
                    cls: 'controlInputDialogItem',
                    tag: 'input'
                }],
                buttons: {
                    'OK': function(){
                        dialog.result = 'OK';
                        dialog.hide();
                    },
                    'Cancel': function(){
                        dialog.result = 'Cancel';
                        dialog.hide();
                    }
                }
            }, function(err, newDialog){
                dialog = newDialog;
                callback(err, dialog);
            } );
        }
        else {
            if(config && config.title){
                dialog.setTitle(config.title);
            }
            callback(refreshError, dialog);
        }
    };

    var functions = {

        show: function(config, callback){
            InputDialog(config, function(err, newDialog){
                dialog.requestCallback = callback;
                dialog.result = null;
                dialog.show();
            })
        }

    };

    Control.registry.InputDialog = functions;
    return functions;
});
