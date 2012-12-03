(function(){

    var dialog = null;

    var createDialog = function(config,callback){
        if(!dialog){
            new control.registry.dialog({
                title: 'New Game AI',
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
                    controlType: 'grid',
                    dock: 'center',
                    autoLoad: true,
                    store: new control.registry.store(),
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
                        field: 'title',
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
            callback(null, dialog);
        }
    };

    var functions = {

        show: function(config, callback){
            createDialog(config, function(err, newDialog){
                dialog.requestCallback = callback;
                dialog.result = null;
                dialog.show();
            })
        }

    };

    control.registry.openDialog = functions;
}())
