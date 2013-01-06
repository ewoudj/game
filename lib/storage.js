var mongo = require('mongojs');
var db = mongo('Framework', ['data']);

function newGuid(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

exports = module.exports = {
    getUserDetails: function(callback){
        callback(null, {name: this.session.identity.data.name || this.session.identity.data.screen_name});
    },
    getCollections: function(callback){
        db.collections(function(err, collections){
            var collectionList = [];
            for(var i = 0, l = collections.length; i < l; i++){
                //var
                collectionList.push({
                    name: collections[i].collectionName
                })
            }
            callback(err, collectionList);
        });
    },
    getObjects: function(query, callback){
        db.data.find(function(err, docs) {
            callback(err, docs);
        });
    },
    setObject: function(object, callback){
        if(!object){
            callback('Cannot set set: ' + object, null);
        }
        else if(!this.session.hasIndentity){
            callback('No user identity is associated with the current session.', null);
        }
        else {
            if(!object._id || object._owner != this.session.identity.data.name){
                object._id = newGuid();
                object._owner = this.session.identity.data.name;
            }
            db.data.update({_id: object._id}, object , {upsert:true}, function(err, updatedObject) {
                callback(err, updatedObject)
            });
        }
    },
    deleteObject: function(object,callback){

    }
};
