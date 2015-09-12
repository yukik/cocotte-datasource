cocotte-datasource
==============

#はじめに

データソースは、データベースのテーブルに似た構造を持つオブジェクトで
行の追加・更新・削除を行う事ができます  
行は元の値と、変更後の値を同時に保存することができます  

# 使用方法

```
var Datasource = require('cocotte-datasource');
var Field = require('cocotte-field');

var config = {
  fields: {
    name : {
      type: Field.Text
    }
  }
};
var ds = new Datasource(config);
var row = ds.add({name: 'foo'});
```

# 初期化

## fields

  + フィールド
  + 必須項目です
  + 名称をキーに、設定を値にします
  + フィールド名をキー、設定を値とします
  + オブジェクトでは、指定したフィールド型による様々なオプションを設定する事が出来ます
  + 例えば、最大文字長を指定する文字列の場合は、`{type: Field.Text, max: 10}`となります
  + 詳しくはcocotte-fieldのREADME.mdを参照してください

## rows {Array.Object}

  + 行データ
  + 配列で、元データを指定することができます
  + 値に配列を設定した場合は、変更前と変更後を同時に指定します
  + 配列でない場合は、変更前の値を指定したことになります
  + 変更後のみを指定する場合は、[null, 値]を設定します
  + システムフィールドが2つ存在します
    + idは行番号を指定します
      + 設定できるのは文字列のみです
      + 設定された行はfindで簡単にアクセスできるようになります
    + stateは行の状態を指定します
      + 1: 新規行
      + 2: 削除行
      + その他: 既存行

```
var rows = [
  {field1: 'foo', field2: 100},
  {field1: ['foo', 'bar'], field2: 50},
  {field1: 'baz'},
  {field2: 70, rowState: 1}
];
```

# プロパティ

## length

  + 行数を取得します

## rows

  + インデックスを指定して行を参照します


# メソッド

## add({Object} data)

  + 行を追加します
  + 引数は省略出来ます
  + 戻り値は追加された行です

## remove({Row} row)

  + 指定行をデータソースから排除します
  + 戻り値は排除できたかどうかを真偽値で返します

## removeAll()

  + 全ての行をデータソースから排除します
  + 戻り値は削除した行数です

## find({String} id)

  + 行を取得します
  + 一致するidの行が複数存在する場合は最初に一致した行が返されます

## forEach({Function} callback)

  + 全行を順次取得し、`callback`を実行します
  + `callback`の第一引数に行を、第二引数にインデックスを、第三引数に行全体の配列を渡されます

## every({Function} callback)

  + すべての行に対して`callback`の結果が真であるかを調べます
  + `callback`の第一引数に行を、第二引数にインデックスを、第三引数に行全体の配列を渡されます

## some({Function} callback)

  + いずれかの行に対して`callback`の結果が真であるかを調べます
  + `callback`の第一引数に行を、第二引数にインデックスを、第三引数に行全体の配列を渡されます

## filter ({Function} callback)

  + `callback`を満たす行を配列で返します
  + `callback`の第一引数に行を、第二引数にインデックスを、第三引数に行全体の配列を渡されます

## map({Function} callback)

  + 各行から新しい配列を作成します
  + `callback`の第一引数に行を、第二引数にインデックスを、第三引数に行全体の配列を渡されます

## reduce({Function} callback, {Mixed} initial)

  + 各行から値を計算します
  + `callback`には４つの引数が渡されます
  + `callback`の前回の戻り値が次の第一引数に渡されます
  + 最初のみinitialが渡されます
  + 第二引数以降は先と同様、行・インデックス・行全体の順で渡されます
  + `initial`は一番最初の行を処理する際の第一引数です
  + `initial`を省略した場合は`undefined`です

## reduceRight({Function} callback, {Mixed} initial)

  + 各行をインデックスの降順で値を計算します
  + それ以外は`reduce`と同じです


# イベント

`ds.on(イベント名, コールバック関数)`でイベントを捕捉することができます

## added (row)

  + 行が追加された

## updated (row, fieldName)

  + 値が更新された

## removed (row)

  + 行が取り除かれた


