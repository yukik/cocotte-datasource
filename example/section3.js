/*global Cocotte*/

// find
var isClient = typeof window === 'object';
var Datasource = isClient ? Cocotte.Datasource : require('..');
var Field      = isClient ? Cocotte.Field      : require('cocotte-field');
var Row        = isClient ? Cocotte.Row        : require('cocotte-row');

var fields = {
  name : {type: Field.Text}
};

var ds = new Datasource({fields: fields});

ds.add({id: 'a-123', state: 1, name: 'foo'});
ds.add({id: 'a-124', state: 2, name: 'bar'});
ds.add({id: 'a-125', state: 1, name: 'baz'});

var row = ds.find('a-123');
console.log(Row.data(row));

row = ds.find({state: 2});
console.log(Row.data(row));

row = ds.find({name: 'foo'});
console.log(Row.data(row));

