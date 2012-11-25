(function(){
    var store = function(config, callback){
        config = config || {};
        merge(this, config);
    };

    store.prototype.get = function(query, callback){
        var items = [{
            firstName: 'Luke',
            lastName: 'Skywalker',
            birthDate: new Date()
        }, {
            firstName: 'Han',
            lastName: 'Solo',
            birthDate: new Date()
        }, {
            firstName: 'Obi-Wan',
            lastName: 'Kenobo',
            birthDate: new Date()
        }, {
            firstName: 'Leia',
            lastName: 'Skywalker',
            birthDate: new Date()
        }];
        for(var i = 0; i < 5; i ++){
            items = items.concat(items);
        }
        callback(null, {
                items:items
            }
        );
    };

    control.registry.store = store;
}())
