define(['Control', 'Store'], function(Control, Store){

    var dialog = null;

    var OpenDialog = function(config,callback){
        if(!dialog){
            Control.create('Dialog', {
                title: config.title || "Select item to open",
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
                    dock: 'left',
                    width: 150,
                    cls: 'leftPanel',
                    resizable: true
                }, {
                    controlType: 'Grid',
                    dock: 'center',
                    name: 'grid',
                    autoLoad: true,
                    store: new Control.registry.Store(),
                    listeners: {
                        'select': function(evtSender, evtName, evtData){
                            dialog.selectedItem = evtData.data;
                            if(evtData.data){
                                dialog.buttons['OK'].enable();
                            }
                            else{
                                dialog.buttons['OK'].disable();
                            }
                        },
                        'doubleClick': function(evtSender, evtName, evtData){
                            dialog.selectedItem = evtData.data;
                            if(evtData.data){
                                dialog.result = 'OK';
                                dialog.hide();
                            }
                        }
                    },
                    columns: [{
                        field: 'name',
                        title: 'Name',
                        width: 80
                    }, {
                        field: 'datetimeCreated',
                        title: 'Created',
                        width: 150
                    }, {
                        field: 'datetimeLastChanged',
                        title: 'Modified',
                        width: 64
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
            dialog.grid.refresh(function(refreshError, refreshResult){
                if(config && config.title){
                    dialog.setTitle(config.title);
                }
                callback(refreshError, dialog);
            })
        }
    };

    var functions = {

        show: function(config, callback){
            OpenDialog(config, function(err, newDialog){
                dialog.requestCallback = callback;
                dialog.result = null;
                dialog.show();
            })
        }

    };

    Control.registry.OpenDialog = functions;
    return functions;
});
