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

## fields

  + フィールド

## Row

  + 型付き行クラス
  + データソースが保有している行はすべてこのクラスのインスタンスです


## length

  + 行数を取得します


## rows

  + インデックスを指定して行を参照します


# メソッド

## data({Object} rowIndex)

  + 指定インデックスの行をオブジェクトにして返します


## add({Object} data)

  + 行を追加します
  + 引数は省略出来ます
  + 戻り値は追加された行です

## save()

  + すべての行を保存します
  + 状態が追加予定と既存の行は、変更後の値を変更前に設定し、状態が既存に変更されます
  + 状態が削除予定と削除済の行は、データソースから排除され、状態が削除済に変更されます


## remove({Row} row)

  + 指定行をデータソースから排除します
  + 戻り値は排除できたかどうかを真偽値で返します


## removeAll()

  + 全ての行をデータソースから排除します
  + 戻り値は削除した行数です


## exists({Row} row)

  + 対象の行をデータソースが保有しているか
  + statusがRow.STATES.DETACHEDの行でもsaveするまではtrueになります


## find({String|Object} id|condition)

  + 行を取得します
  + 一致する行が複数存在する場合は最初に一致した行が返されます
  + 文字列を指定した場合は、idが一致する行を探します
  + オブジェクトを指定した場合は、フィールドを指定して値が一致した行を探します
      + `{name:'foo}`はnameフィールドが'foo'の値の行を抽出します
      + `{age: [10, 19]}`はageフィールドが10から19の値の行を抽出します
        + 開始か終了をnullにすると以上、以下となります
      + `{age: function(v){return v%2;}}`はageフィールドが奇数の行を抽出します
        + 判定を行う関数の第一引数には指定フィールドの値が、第二引数には行が、第三引数にはデータソースが渡されます
        + 複雑な条件を設定することができます


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

(注意)データソースが保持していない行インスタンスがイベントを発行することがあります  
その際、連動してデータソースが以下のイベントを実行することがあります  
データソースに存在しない行を除外したい場合は、`ds.exists(row)`と併用する必要が有ります  
これはデータテーブルにイベント発行する必要があるためであり、正常な動作です


## added ({Row} row)

  + 行が追加された


## updated ({Row} row, {String} fieldName)

  + 値が更新された


## threw ({Row} row, {String} fieldName)

  + 値の更新に失敗した


## removed ({Row} row)

  + 行が取り除かれた


## all ({String} eventName, {Row} row, {String} fieldName)

  + すべてのイベントを捕捉することができます
  + 引数は、第一引数にイベント名、それ以降にそのイベントの引数です




