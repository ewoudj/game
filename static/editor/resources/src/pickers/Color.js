define(['Control', 'Button'], function(Control, Button){

    var ColorPicker = function(config, callback){
        config = config || {};
        config.cls = 'controlColorPicker';
        Button.call(this, config, function(err, newPicker){
            ColorPicker.createColorTable(newPicker.el, function(color){
                newPicker.selectedColor = color;
            });
            callback(err, newPicker);
        });
        return this;
    };

    ColorPicker.inheritsFrom(Button);

    ColorPicker.createColorTable = function(targetEl, handler){

        var table = document.createElement('table'), half = 'half';
        createRow({r: true,  g: false, b: false}); // Red
        createRow({r: true,  g: half,  b: false}); // Orange
        createRow({r: true,  g: true,  b: false}); // Yellow
        createRow({r: half,  g: true,  b: false}); // yellow-Green
        createRow({r: false, g: true,  b: false}); // Green
        createRow({r: false, g: true,  b: half});  // Green-Cyan
        createRow({r: false, g: true,  b: true});  // Cyan
        createRow({r: false, g: half,  b: true});  // Slate
        createRow({r: false, g: false, b: true});  // Blue
        createRow({r: half,  g: false, b: true});  // Purple
        createRow({r: true,  g: false, b: true});  // Magenta
        createRow({r: half,  g: half,  b: half});  // White, grayscale
        (targetEl || document.body).appendChild(table);

        table.addEventListener('click', function(e){
            var evt = e || window.event;
            if(evt.target.tagName == 'TD' && handler){
                handler(evt.target.style.backgroundColor);
            }
        }, false);

        function createRow(fixed){
            var s, j, col, row = document.createElement('tr');
            var color = {r: 255, g: 255, b: 255};
            for (j = 0; j < 15; j++) {
                for(s in color){
                    if(fixed[s] == half){
                        color[s] = color[s] - 16;
                    }
                    else if((!fixed[s] && j < 8) || (fixed[s] && j > 7)){
                        color[s] = color[s] - 32;
                    }
                }
                col = document.createElement('td');
                col.style.backgroundColor = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
                row.appendChild(col);
            }
            table.appendChild(row);
        }

    };

    Control.registry['pickers.Color'] = ColorPicker;
    return ColorPicker;
});
