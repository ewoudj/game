define(['Control', 'TabPanel', 'dialogs/OpenDialog'], function(Control, TabPanel, OpenDialog){
    var EditorContainer = function(config, callback){
        config = config || {
        };
        config.openItems = {};
        var self = this;
        TabPanel.call(this, config, function(err, newEditorContainer){
            self.parentControl.on('initialized', function(p){
                self.parentControl.topBar.addItems([
                    EditorContainer.getFileButtonConfig(self),
                    EditorContainer.getHelpButtonConfig(self)
                ]);
            });
            callback(err, newEditorContainer);
        });
    };

    EditorContainer.inheritsFrom(TabPanel);

    EditorContainer.registry = {
        js: {
            editorType: 'editors.TextEditor',
            arguments: []
        },
        presentation: {
            editorType: 'editors.PresentationEditor',
            arguments: []
        }
    };

    EditorContainer.defaultEditor = {
        editorType: 'editors.TextEditor',
        arguments: []
    };

    EditorContainer.prototype.setActiveTab = function(newActiveTab, callback){
        var self = this;
        if(this.activeTab && this.activeTab.toolbarButtons){
            self.parentControl.topBar.removeItems(this.activeTab.toolbarButtons);
        }
        TabPanel.prototype.setActiveTab.call(this, newActiveTab, function(err, activatedTab){
            if(self.activeTab.panelItem.getButtonConfig){
                self.parentControl.topBar.addItems(self.activeTab.toolbarButtons || self.activeTab.panelItem.getButtonConfig(),
                    function(errButtons, buttonItems){
                        self.activeTab.toolbarButtons = buttonItems;
                        callback(err, activatedTab);
                });
            }
            else {
                callback(err, activatedTab);
            }
        });
    };

    EditorContainer.prototype.open = function(itemToOpen, callback){
        callback = callback || function(){};
        var self = this;
        if(this.openItems[itemToOpen.name || itemToOpen.title]){
            // The item is already open, activate the tab
            this.setActiveTab(this.openItems[itemToOpen.name || itemToOpen.title], callback);
        }
        else {
            // The item is not yet open, create editor and tab
            var extension = '';
            var parts = itemToOpen.name.split('.');
            if(parts.length > 1){
                extension = parts[parts.length - 1];
            }
            var editor = EditorContainer.registry[extension]  || EditorContainer.defaultEditor;
            this.addTab({
                title: itemToOpen.name || itemToOpen.title || 'My First Panel',
                controlType: editor.editorType,
                closable: true,
                item: itemToOpen
            }, function(err, newPanel){
                self.openItems[itemToOpen.name || itemToOpen.title] = newPanel;
                newPanel.panelItem.setValue(itemToOpen.script);
                callback(err, newPanel);
            });
        }
    };

    EditorContainer.prototype.save = function(callback){
        callback = callback || function(){};
        if(this.activeTab){
            var editor = this.activeTab.panelItem;
            editor.item.script = editor.getValue();
            editorbehaviour.setObject(editor.item,function(err, updatedObject){
                callback(err, updatedObject);
            });
        }
        else{
            callback(null, null);
        }
    };

    EditorContainer.prototype.removeTab = function(tabToRemove){
        tabToRemove = tabToRemove || this.activeTab;
        TabPanel.prototype.removeTab.call(this, tabToRemove);
        this.openItems[tabToRemove.panelItem.item.name || tabToRemove.panelItem.item.title] = null;
    };

    EditorContainer.getFileButtonConfig = function(editor){
        return {
            text: 'File',
            iconCls: 'bNew',
            menu: [{
                text: 'New',
                listeners: {
                    'click': function(){
                        InputDialog.show({
                            title: 'New File',
                            description: 'Enter a new name for your file:',
                            height: 140,
                            value: 'New file.txt'
                        },function(inputError, inputResult){
                            if(inputError){
                                alert(inputError)
                            }
                            else if(inputResult){
                                workbench.editor.open({
                                    name: inputResult
                                });
                            }
                        });
                    }
                }
            }, '-',{
                text: 'Open...',
                iconCls: 'bOpen',
                listeners: {
                    'click': function(){
                        OpenDialog.show({
                            title: 'Open File'
                        },function(openError, openedItem){
                            if(openError){
                                alert(openError)
                            }
                            else if(openedItem){
                                editor.open(openedItem);
                            }
                        });
                    }
                }
            }, '-',{
                text: 'Manage database...',
                iconCls: 'bPreferences',
                listeners: {
                    'click': function(){
                        control.registry.databaseDialog.show({
                            title: 'Database Management'
                        },function(dbError, dbResult){

                        });
                    }
                }
            }, '-', {
                text: 'Save',
                iconCls: 'bSave',
                listeners: {
                    'click': function(){
                        workbench.editor.save();
                    }
                }
            },{
                text: 'Rename...',
                iconCls: 'bSave',
                listeners: {
                    'click': function(){
                        var activeItem = workbench.editor.activeTab.panelItem.item;
                        InputDialog.show({
                            title: 'Rename File',
                            description: 'Enter a new name for your file:',
                            height: 140,
                            value: activeItem.name || activeItem.title
                        },function(inputError, inputResult){
                            if(inputError){
                                alert(inputError)
                            }
                            else if(inputResult){
                                activeItem.name = inputResult;
                                workbench.editor.save();
                                workbench.editor.removeTab();
                                workbench.editor.open(activeItem);
                            }
                        });
                    }
                }
            }]
        };
    };

    EditorContainer.getHelpButtonConfig = function(editor){
        return {
            //text: 'Help',
            name: 'helpButton',
            iconCls: 'bHelp',
            menu: [{
                text: 'Preferences',
                iconCls: 'bPreferences',
                menu: [{
                    text: 'Editor settings',
                    iconCls: 'bPreferences'
                }, {
                    text: 'Account settings',
                    iconCls: 'bPreferences',
                    menu: [{
                        text: 'Editor settings',
                        iconCls: 'bPreferences'
                    }, {
                        text: 'Account settings',
                        iconCls: 'bPreferences'
                    }]
                }]
            }, {
                controlType: 'Separator'
            }, {
                text: 'Sign out',
                iconCls: 'bSignOut'
            }]
        };
    };

    Control.registry['editors.EditorContainer'] = EditorContainer;
    return EditorContainer;
});
