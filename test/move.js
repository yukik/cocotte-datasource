
var assert = require('assert');

var Datasource = require('..');
var schema = {fields: {name: 'cocotte-field-text'}};
var ds = new Datasource(schema);

var rows = [];
for(var i = 0; i < 3; i++) {
  rows.push(ds.add());
}

var row;


assert(ds.currentRow === null);
assert(ds.currentIndex === -1);


row = ds.first();
assert(row === rows[0]);
assert(ds.currentRow === rows[0]);
assert(ds.currentIndex === 0);

row = ds.next();
assert(row === rows[1]);
assert(ds.currentRow === rows[1]);
assert(ds.currentIndex === 1);

row = ds.next();
assert(row === rows[2]);
assert(ds.currentRow === rows[2]);
assert(ds.currentIndex === 2);

row = ds.next();
assert(row === null);
assert(ds.currentRow === rows[2]);
assert(ds.currentIndex === 2);

ds.currentRow = null;
row = ds.next();
assert(row === rows[0]);
assert(ds.currentRow === rows[0]);
assert(ds.currentIndex === 0);
