var Datasource = require('..');
var Field = require('cocotte-field');

// var config = {
//   fields: {
//     name: {
//       type: Field.Text
//     }
//   },
//   rows: [
//     {id: '123', name: 'foo'},
//     {id: '456', name: 'bar'}
//   ]
// };

// var ds = new Datasource(config);





var config = {
  fields: {
    name : {
      type: Field.Text
    }
  }
};
var ds = new Datasource(config);


ds.on('added', function(row) {
  console.log('added---', row.id);
});

ds.on('updated', function(row, fieldName) {
  console.log('updated---', row.id, fieldName);
});

var row = ds.add();
row.name = 'foo';

// ds.rows[0].name = 'baz';

