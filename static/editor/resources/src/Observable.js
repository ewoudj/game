define(function(){

    var observable = {};

    observable.make = function(o){

        o.on = function(eventName, handler){
            if(!o.observers){
                o.observers = {};
            }
            if(!o.observers[eventName]){
                o.observers[eventName] = [];
            }
            o.observers[eventName].push(handler);
            if(o.fired && o.fired[eventName]){
                handler(o, eventName, o.fired[eventName]);
            }
        };

        o.fire = function(eventName, eventData, fireOnce){
            if(fireOnce){
                o.fired = o.fired || {};
                o.fired[eventName] = eventData;
            }
            if(o.observers && o.observers[eventName]){
                var observers = o.observers[eventName];
                for(var i = 0; i < observers.length; i++){
                    observers[i](o, eventName, eventData);
                }
            }
        };

        if(o.listeners){
            for(s in o.listeners){
                o.on(s, o.listeners[s]);
            }
        }

    };

    return observable;

});