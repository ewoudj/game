(function(){

    var dialog = null;

    var databaseDialog = function(config,callback){
        if(!dialog){
            new control.registry.dialog({
                title: config.title || 'Database Management',
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
                    name: 'collectionList',
                    resizable: true
                }, {
                    controlType: 'grid',
                    dock: 'center',
                    autoLoad: true,
                    store: new control.registry.store(),
                    listeners: {
                        'select': function(evtSender, evtName, evtData){
                            dialog.selectedItem = evtData.data;
                        },
                        'doubleClick': function(evtSender, evtName, evtData){
                            dialog.selectedItem = evtData.data;
                        }
                    },
                    columns: [{
                        field: '_id',
                        title: 'ID',
                        width: 80
                    }, {
                        field: '_type',
                        title: 'Type',
                        width: 150
                    }, {
                        field: '_owner',
                        title: 'Owner',
                        width: 64
                    }]
                }]
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
            databaseDialog(config, function(err, newDialog){
                dialog.requestCallback = callback;
                dialog.show();
            })
        }

    };

    control.registry.databaseDialog = functions;
}())
