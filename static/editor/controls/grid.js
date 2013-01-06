(function(){
    var grid = function(config, callback){
        callback = callback || function(){};
        config = config || {};
        config = merge({
            cls: 'controlGrid',
            cssId: control.getId(),
            items: []
        }, config);
        config.cls += (' ' + config.cssId);
        config.items.push({
            cls: 'controlGridHeader',
            name: 'header',
            items: [{
                tag: 'table',
                name: 'table'
            }]
        });
        config.items.push({
            cls: 'controlGridBody',
            name: 'body',
            items: [{
                tag: 'table',
                name: 'table'
            }]
        });
        var self = this;
        control.call(this, config, function(err, newItem){

            self.body.el.addEventListener('scroll', function(e){
                var evt = window.event || e;
                self.header.el.scrollLeft = self.body.el.scrollLeft;
                var difference = self.header.el.scrollLeft - self.body.el.scrollLeft;
                self.header.el.style.marginLeft = difference + 'px';
            });

            self.body.el.addEventListener('dblclick', function(e){
                if(self.selectedRow){
                    self.fire('doubleClick', {
                        grid: self,
                        row: self.selectedRow,
                        data: self.selectedRow ?  self.selectedRow.data : null
                    });
                }
            });

            self.body.el.addEventListener('mouseup', function(e){
                var evt = window.event || e;
                var rowEl = evt.srcElement;
                while(rowEl.localName != 'tr' && rowEl.parentElement){
                    rowEl = rowEl.parentElement;
                }
                if(self.selectedRow){
                    self.selectedRow.removeClass('selected');
                }
                if(rowEl.localName == 'tr'){
                    self.selectedRow = self.body.table.items[rowEl.sectionRowIndex];
                    self.selectedRow.addClass('selected');
                }
                else{
                    self.selectedRow = null;
                }
                self.fire('select', {
                    grid: self,
                    row: self.selectedRow,
                    data: self.selectedRow ?  self.selectedRow.data : null
                });
            });

            if(self.autoLoad && !err){
                self.setColumns(self.columns, function(){
                    self.load(function(loadErr, loadResult){
                        callback(loadErr, newItem);
                    });
                });
            }
            else{
                callback(err, newItem);
            }

        });
    };

    grid.inheritsFrom(control);

    grid.prototype.setColumns = function(cols, callback){

        var self;

        var row = {
            tag: 'tr',
            items: [],
            name: 'row'
        };

        var createColumn = function(r, cssId, columnData, index){
            control.setCssSelector('.' + cssId + ' .c' + index, 'width:' + columnData.width + 'px')
            var col = {
                tag: 'td',
                resizable: true,
                resizeEdges: {
                    top: false,
                    left: false,
                    right: true,
                    bottom: false
                },
                resize: function(){
                    control.setCssSelector('.' + cssId + ' .c' + index, 'width:' + this.width + 'px');
                    self.updateFiller();
                },
                items: [{
                    tag: 'span',
                    cls: 'c' + index,
                    items: [columnData.title]
                }]
            };
            r.items.push(col);
        }

        for(var i = 0; i < cols.length; i++){
            createColumn(row, this.cssId, cols[i], i);
        }
        row.items.push({
            tag: 'td',
            cls: 'filler',
            items: [{
                tag: 'span',
                cls: 'filler'
            }]
        });
        var self = this;
        this.header.table.addItem(row, function(err, res){
            self.updateFiller();
            callback(err,res);
        });
    };

    grid.prototype.resize = function(){
        this.updateFiller();
    };

    grid.prototype.updateFiller = function(){
        var lastColumn = this.header.table.row.items[ this.header.table.row.items.length - 2 ];
        var lastColumnEl = lastColumn.el;
        var rightMostEdge = lastColumnEl.offsetLeft + lastColumnEl.offsetWidth + 1;
        var fillerWidth = this.el.clientWidth - rightMostEdge;
        if(fillerWidth < 0){
            fillerWidth = 0;
        }
        control.setCssSelector('.' + this.cssId + ' .filler', 'width:' + fillerWidth + 'px')
    };

    grid.prototype.clear = function(){
        this.body.table.removeAllItems();
    };

    grid.prototype.refresh = function(callback){
        this.clear();
        this.load(callback);
    };

    grid.prototype.load = function(callback){
        var self = this, newHeight;
        this.store.get(self.query, function(err, queryResult){
            var fragmentConfig = {
                tag: 'fragment',
                items: []
            };
            for(var i = 0, l = queryResult.items.length; i < l; i++){
                var item = queryResult.items[i];
                var row = {
                    tag: 'tr',
                    data: item,
                    dataIndex: i,
                    items: []
                };
                fragmentConfig.items.push(row);
                for(var j = 0, m = self.columns.length; j < m; j++){
                    var fieldName = self.columns[j].field;
                    var fieldValue = item[fieldName] || '';
                    var col = {
                        tag: 'td',
                        items: [{
                            tag: 'span',
                            cls: 'c' + j,
                            items: [fieldValue.toString()]
                        }]
                    };
                    row.items.push(col);
                }
                row.items.push({
                    tag: 'td',
                    cls: 'filler',
                    items: [{
                        tag: 'span',
                        cls: 'filler'
                    }]
                });
            }
            var ctrl = new control(fragmentConfig, function(err, fragmentControl){
                self.body.table.el.appendChild(fragmentControl.el);
                self.body.table.items = self.body.table.items.concat(fragmentControl.items);
                callback(err, queryResult);
                self.fire('select', {
                    grid: self,
                    row: self.selectedRow,
                    data: self.selectedRow ?  self.selectedRow.data : null
                });
            });
        });
    };

    control.registry.grid = grid;
}())
