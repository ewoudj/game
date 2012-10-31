var connect = require('connect');
var config = require('./config');
var ajax = require('./lib/ajax');
var authentication = require('./lib/authentication');

try{
    var configLocal = require('./config.local');
    if(configLocal){
        config = configLocal;
    }
}
catch(exc){
    // Ignore missing local config file
}

var server = connect()
	.use(function(req, res, next){
		console.log(req.originalUrl);
        if(req.url.indexOf('//') === 0){
            req.url = req.originalUrl = req.url.substr(1);
        }
		next();
	})
    .use(authentication('/auth', config.mountPoint || "", config.identityProviders))
    .use(connect.cookieParser())
    .use(connect.session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
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
        }
    }}))
    .use(connect.staticCache())
	.use(connect.static(__dirname + '/static')
);

console.log('Game server listening at port 8001');
server.listen(8001);

