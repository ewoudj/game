var connect = require('connect');
var config = require('./config');
var ajax = require('./lib/ajax');
var authentication = require('./lib/authentication');
var mongojs = require('mongojs');
var db = mongojs('Framework', ['data']);

try{
    var configLocal = require('./config.local');
    if(configLocal){
        config = configLocal;
    }
}
catch(exc){
    // Ignore missing local config file
}

function newGuid(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

var server = connect()
	.use(function(req, res, next){
		console.log(req.originalUrl);
        if(req.url.indexOf('//') === 0){
            req.url = req.originalUrl = req.url.substr(1);
        }
		next();
	})
    .use(connect.cookieParser())
    .use(connect.session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
    .use(authentication('/auth', config.mountPoint || "", config.identityProviders))
    .use(connect.bodyParser())
    .use(function(req, res, next){
        if(config.debug && !req.session.hasIndentity){
            req.session.hasIndentity = true;
            req.session.identity = config.debugUser;
        }
        if(req.originalUrl.indexOf('/editor/') == 0 && !req.session.hasIndentity){
            res.writeHead(302, {
                'Location': '../signin.html'
            });
            res.end();
        }
        else {
            next();
        }
    })
    .use(ajax({'/editor/behaviour': {
        getUserDetails: function(callback){
            callback(null, {name: this.session.identity.data.name || this.session.identity.data.screen_name});
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
    }}))
	.use(connect.static(__dirname + '/static')
);

console.log('Game server listening at port 8001');
server.listen(8001);

