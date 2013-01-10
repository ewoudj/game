// Some examples
createPalette();

createPalette(450, 200, null, false, true);

createPalette(450, 200, null, false, true, true);

createPalette(500, 300, null, true, true);

createPalette(800, 200, null, false, true, true);

createPalette(200, 200);

// Creates a palette, return the canvas;
function createPalette(width, height, parentEl, vertical, invert, full, handler){
    // Initialize basic configuration
    var horizontal = !vertical;
    var half = !full;
    parentEl = parentEl || document.body;
    width = width  || 450;
    height = height || 200;
    // Set up the canvas element on wich we will draw the palette
    var canvas = document.createElement('canvas');
    canvas.height = height;
    canvas.width = width;
    parentEl.appendChild(canvas);
    // Mouse move will invoke the handler color under the cursor
    canvas.onmousemove = function(e) {
        var c = context.getImageData(e.offsetX, e.offsetY, 1, 1).data;
        if(handler){
            handler(canvas, context, c);
        }
    };
    // Set up the drawing context
    var context = canvas.getContext('2d');
    context.lineWidth = 1;
    var scale = (half ? 256 : 512) / (horizontal ? height : width);
    // Draws the palette line by line, each line contains all colors
    // but is rendered at different darkness / lightness
    for(var i = 0; i < (horizontal ? height : width); i++){
        var step = Math.ceil(i * scale);
        context.strokeStyle = createGradient(step, height);
        context.beginPath();
        context.moveTo(horizontal ? 0 : i, horizontal ? i: 0);
        context.lineTo(horizontal ? width : i,horizontal ? i : height);
        context.stroke();
    }
    // Creates a gradiet for a given line
    function createGradient(step, height){
        var gradient= context.createLinearGradient(0, 0, horizontal ? width : 0, horizontal ? 0 : height);
        var p = step, s = 0;
        if(p > 255){
            s = p - 255;
            p = 255;
        };
        if(invert){
            p = 255 - p;
            s = 255 - s;
        }
        gradient.addColorStop(0,     'rgb(' + p + ',' + s + ',' + s + ')');
        gradient.addColorStop(0.166, 'rgb(' + p + ',' + p + ',' + s + ')');
        gradient.addColorStop(0.333, 'rgb(' + s + ',' + p + ',' + s + ')');
        gradient.addColorStop(0.5,   'rgb(' + s + ',' + p + ',' + p + ')');
        gradient.addColorStop(0.666, 'rgb(' + s + ',' + s + ',' + p + ')');
        gradient.addColorStop(0.833, 'rgb(' + p + ',' + s + ',' + p + ')');
        gradient.addColorStop(1,     'rgb(' + p + ',' + s + ',' + s + ')');
        return gradient;
    }

    return canvas;
};



