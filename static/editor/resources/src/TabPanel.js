define(['Control', 'Panel', 'Toolbar', 'Button'], function(Control, Panel, Toolbar, Button){
    var TabPanel = function(config, callback){

        // As we will override style from button we load our style
        // after the button was loaded ( in the define)
        require(['css!../css/tabpanel']);

        this.activeTab = null;
        config = config || {};
        config.cls = 'controlTabPanel';
        config.availableItems = config.items || [];
        config.items = [];
        config.topBar = [];
        for(var i = 0, l = config.availableItems.length; i < l; i++){
            var item = config.availableItems[i];
            config.topBar.push(this.createTabConfig(item));
        }
        var self = this;
        Panel.call(this, config, function(err, newTabPanel){
            if(newTabPanel.topBar.items.length > 0){
                newTabPanel.setActiveTab(newTabPanel.topBar.items[0], function(activateErr, newActiveTab){
                    callback(err, newTabPanel);
                });
            } else {
                newTabPanel.topBar.hide();
                callback(err, newTabPanel);
            }
        });
    };

    TabPanel.inheritsFrom(Panel);

    TabPanel.prototype.createTabConfig = function(tabItemConfig){
        var self = this;
        return {
            panelItemConfig : tabItemConfig,
            iconCls: tabItemConfig.iconCls || 'bNew',
            listeners: {
                'click': function(clickedTab){
                    if(!clickedTab.removed){
                        self.setActiveTab(clickedTab);
                    }
                }
            },
            items: [tabItemConfig.title || '', {
                controlType: 'Button',
                cls: 'controlToolButton',
                hidden: !(tabItemConfig.closable),
                listeners: {
                    'click': function(closeToolButton){
                        self.removeTab(closeToolButton.parentControl);
                    }
                }
            }]
        };
    };

    TabPanel.prototype.addTab = function(tabItemConfig, callback){
        var tabConfig = this.createTabConfig(tabItemConfig);
        var self = this;
        this.topBar.addItem(tabConfig, function(err, newTab){
            self.setActiveTab(newTab, callback);
            if(self.topBar.isHidden()){
                self.topBar.show();
            }
        });
    };

    TabPanel.prototype.removeTab = function(tabToRemove){
        if(this.activeTab === tabToRemove && tabToRemove.panelItem){
            this.activeTab = null;
            var alternateTab = this.getAlternateTab(tabToRemove);
            if(alternateTab){
                this.setActiveTab(alternateTab, function(){});
            }
            this.removeItem(tabToRemove.panelItem, false);
        }
        else if(tabToRemove.panelItem){
            this.removeItem(tabToRemove.panelItem, false);
        }
        tabToRemove.removed = true;
        this.topBar.removeItem(tabToRemove, false);
        if(this.topBar.items.length < 1){
            this.topBar.hide();
        }
    };

    // In case a tab get closed this is a small heuristic to select another
    // tab to switch to.
    TabPanel.prototype.getAlternateTab = function(tab){
        var result = null;
        var tabIndex = this.topBar.items.indexOf(tab);
        if(tabIndex > 0){
            result = this.topBar.items[tabIndex - 1];
        }
        else if(this.topBar.items.length > tabIndex + 1){
            result = this.topBar.items[tabIndex + 1];
        }
        return result;
    };

    TabPanel.prototype.setActiveTab = function(newActiveTab, callback){
        callback = callback || function(){};
        if(this.activeTab != newActiveTab){
            if(this.activeTab){
                //this.removeItem(this.activeTab.panelItem, true);
                this.activeTab.panelItem.hide();
                this.activeTab.removeClass('selected');
            }
            this.activeTab = newActiveTab;
            if(this.activeTab){
                var self = this;
                var itemToAdd = this.activeTab.panelItem || this.activeTab.panelItemConfig;
                itemToAdd.dock = 'center';
                if(itemToAdd.parentControl === this){
                    self.activeTab.addClass('selected');
                    this.activeTab.panelItem.show();
                    this.activeTab.panelItem.focus();
                    if(this.activeTab.panelItem.resize){
                        this.activeTab.panelItem.resize();
                    }
                    callback(null, newActiveTab);
                }
                else{
                    this.addItem(itemToAdd, function(err, addedItem){;
                        self.activeTab.addClass('selected');
                        self.activeTab.panelItem = addedItem;
                        addedItem.focus();
                        callback(err, newActiveTab);
                    });
                }
            }
            else{
                callback(null, newActiveTab);
            }
        }else{
            callback(null, newActiveTab);
        }
    };

    Control.registry.TabPanel = TabPanel;
    return TabPanel;
});
