var authom = require('authom');

exports = module.exports = function (path, mountPoint, identityProviders){

    for(var i = 0, l = identityProviders.length; i < l; i++){
        authom.createServer(identityProviders[i]);
    }

    authom.on('auth', function(req, res, data) {
        req.session.hasIndentity = true;
        req.session.identity = data;
        res.writeHead(302, {
            'Location': '../editor/index.html'
        });
        res.end();
    });

    authom.on('error', function(req, res, data) {
        console.log('Authentication failed: ' + JSON.stringify(data));
        res.writeHead(302, {
            'Location': '../signin.html'
        });
        res.end();
    });

    return function(req, res, next){
        if(req.url.indexOf(path) == 0){
            req.mountPoint = mountPoint;
            authom.listener(req, res);
        }
        else {
            next();
        }
    };
};
