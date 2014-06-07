'use strict';

var Datasource = require('..');

var schema = {
  fields: {
    name: 'cocotte-field-text',
    job:  {type: 'cocotte-field-text', max: 10}
  }
};

var ds = new Datasource(schema);

// イベント
ds.on('moved', function (row) {
  console.log(' moved: ' + (row ? row.name : 'null'));
});

ds.add({name: 'foo'});
ds.add({name: 'bar'});
ds.add({name: 'baz'});

ds.next(); // 最初の行にフォーカス
ds.next();
ds.first();

console.log('移動しない ここから');
ds.first(); // 移動しないのでイベントは未発行
ds.first(); // 移動しないのでイベントは未発行
console.log('移動しない ここまで');

ds.last();
ds.back();
ds.next();

console.log('移動しない ここから');
ds.next();  // 移動しないのでイベントは未発行
ds.next();  // 移動しないのでイベントは未発行
console.log('移動しない ここまで');

ds.curentIndex = null;  // 未設定に移動する
ds.curentIndex = 2;
ds.remove();    // 行を削除すると未設定に移動する


console.log('forEachでは移動しない ここから');
var rowsCount = 0;
ds.forEach(function (row) {
  row = null;
  rowsCount++;
});
console.log('現在の行数: ' + rowsCount);
console.log('forEachでは移動しない ここまで');


