cocotte-datasource
==============

#はじめに

データソースは、データベースのテーブルに似た構造を持つオブジェクトで
行の追加・更新・削除を行う事ができます。  
データベースは必要は無く、またフィールドも自由に定義する事ができます。

# 使用方法

```
var Datasource = require('cocotte-datasource');
var schema = {
  fields: {
    name: 'cocotte-field-text'
  }
}
var ds = new Datasource(schema);
var row = ds.add();
row.name = 'foo';
```


(API)

 * データソース Datasource.md 
 * 行 Row.md





