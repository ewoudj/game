define(['../Control'], function(Control){

    // If the defines module is in a subdirectory (like dialogs), the loading of css
    // runs into a issue with require.js / css loading where the path is incorrectly constructed.
    // To bypass this issue we load the css as in the following line:
    require(['css!../css/InputDialog']);

    var dialog = null;

    var InputDialog = function(config,callback){
        if(!dialog){
            Control.create('Dialog', {
                title: config.title || "Please enter the required input",
                width: config.width || 350,
                height: config.height || 160,
                cls: 'controlPanel controlDialog controlInputDialog',
                resizable: false,
                listeners:{
                    'hide': function(){
                        if(dialog.requestCallback){
                            if(dialog.result === 'OK'){
                                dialog.requestCallback(null, dialog.inputPanel.input.el.value);
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
                    name: 'descriptionPanel',
                    items: [config.description || 'Please provide the required input']
                }, {
                    dock: 'bottom',
                    height: 22,
                    cls: 'controlInputDialogItem',
                    name: 'inputPanel',
                    items: [{
                        tag: 'input',
                        name: 'input'
                    }]

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
                dialog.descriptionPanel.items[0].setText(config.description);

            }
            callback(null, dialog);
        }
    };

    var functions = {

        show: function(config, callback){
            InputDialog(config, function(err, newDialog){
                dialog.requestCallback = callback;
                dialog.result = null;
                dialog.show();
                dialog.inputPanel.input.el.focus();
                dialog.inputPanel.input.el.value = config.value;
            });
        }

    };

    Control.registry.InputDialog = functions;
    return functions;
});
