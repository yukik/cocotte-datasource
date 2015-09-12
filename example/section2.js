/**
 * データソース内のイベント
 */

var Datasource = require('..');
var Field = require('cocotte-field');
var Row = require('cocotte-row');

var config = {
  fields: {
    name: {
      type: Field.Text
    }
  }
};
var ds = new Datasource(config);

ds.on('added', function(row) {console.log('added', row.name);});
ds.on('updated', function(row, fieldName){console.log('updated', row.name, fieldName);});
ds.on('removed', function(row) {console.log('removed', row.name);});

var row = ds.add({name: 'foo'});

row.name = 'bar';
ds.remove(row);

row = ds.add({id: '1234', name: 'baz', state: Row.STATES.EXISTS});

ds.save();



