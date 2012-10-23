var UglifyJS = require("../static/resources/script/uglifyjs2/tools/node");
var fs = require('fs');

var clientSet = [
    "../static/laserwar/audio.js",
    "../static/laserwar/helpers.js",
    "../static/laserwar/entity.js",
    "../static/laserwar/explosion.js",
    "../static/laserwar/ship.js",
    "../static/laserwar/ufo.js",
    "../static/laserwar/star.js",
    "../static/laserwar/laserbeam.js",
    "../static/laserwar/scorebar.js",
    "../static/laserwar/rules.js",
    "../static/laserwar/engine.js",
    "../static/laserwar/settings.js",
    "../static/laserwar/menu.js",
    "../static/laserwar/ai/prioritizing.js",
    "../static/laserwar/ai/heuristic.js",
    "../static/laserwar/ai/ufo.js",
    "../static/laserwar/renderer/canvas.js",
    "../static/laserwar/controller/touch.js",
    "../static/laserwar/controller/mouse.js"
];

var webGlSet = [
    "../static/resources/script/Three.js",
    "../static/resources/fonts/cbm-64_normal.typeface.js",
    "../static/laserwar/renderer/webgl.js"
];

var fullClientSet = clientSet.concat(webGlSet);
var result = UglifyJS.minify(clientSet);
fs.writeFileSync('../static/all.js', result.code);

console.log( 'Compression - Finished' );


