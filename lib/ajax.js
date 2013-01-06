exports = module.exports = function (config){

    var invokeFunctionString = (function invokeFunction(func, args){
        args = Array.prototype.slice.call(args);
        var callback = args.pop();
        var obj = {
            "function": func,
            "arguments": args
        };
        var request = new XMLHttpRequest();
        request.open("POST", moduleUrl ,true);
        request.setRequestHeader("Content-type","application/json");
        request.returnedCall = false;
        request.onreadystatechange = function()
        {
            if(request.readyState === 4){
                if(request.status === 200){
                    if(!request.returnedCall){
                        var result = JSON.parse(request.responseText);
                        callback(result.error, result.result);
                        request.returnedCall = true;
                    }
                }
                else {
                    callback(request.statusText, null);
                }
            }
        }
        request.send(JSON.stringify(obj));
    }).toString();

    for(var url in config){
        var scriptUrl = url + '.js';
        config[scriptUrl] = generateClient(config[url], url);
    }

    function nameFromUrl(url){
        return url.replace(/\//g,'');
    }

    function generateClient(o, url){
        var result = '' +
            '\n' +
            '\n' +
            'window.' + nameFromUrl(url) + ' = (function() {\n' +
            '  var scripts = document.getElementsByTagName("script");\n' +
            '  var thisScript = scripts[scripts.length-1].src;\n' +
            '  var moduleUrl = thisScript.substr(0, thisScript.length - 3);\n' +
            '  return {\n';
        for(var functionName in o){
            if(typeof(o[functionName]) == 'function'){
                var functionString = o[functionName].toString();
                functionString = functionString.substring(
                    0,
                    functionString.indexOf('{')
                );
                result = result +
                    ('    ' + functionName + ': ' + functionString +
                    '{invokeFunction("' + functionName + '", arguments);},\n');
            }
        }
        result = result +
            '  };\n' +
            '  ' + invokeFunctionString + '\n' +
            '})();';
        return result;
    }

    return function(req, res, next){

        function resultHandler(err, result){
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify({
                error: err,
                result: result
            }));
            res.end();
        }

        if(config[req.url]){
            var item = config[req.url];
            if(typeof(item) == 'string'){
                res.writeHead(200, {'Content-Type': 'application/javascript'});
                res.end(item);
            }
            else{
                var b = req.body;
                b.arguments = b.arguments || [];
                b.arguments.push(resultHandler);
                try{
                    item[b.function].apply(req, b.arguments);
                }
                catch (exc){
                    resultHandler(exc , null);
                }
            }
        }
        else{
            next();
        }
    };
};