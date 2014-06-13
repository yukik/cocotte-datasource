Row
==============

行オブジェクトのプロパティもしくはメソッドの説明

# プロパティ

## $fields

  + {Object}
  + readonly
  + すべてのフィールドを取得

## $object

  + {Object}
  + readonly
  + 全フィールドの値を取得

## $before

  + {Object}
  + readonly
  + 全フィールドの変更前の値を取得

## $after

  + {Object}
  + readonly
  + 全フィールドの変更後の値を取得

## $error

  + {Object}
  + readonly
  + 全フィールドのエラーを取得

## $mofifiedNames 

  + {Array}
  + readonly
  + 変更されているフィールド名の一覧

## {{fieldName}}

  + 指定したフィールドの値の取得・設定

## {{fieldName}}$before

  + 指定したフィールドの変更前の値の取得・設定

## {{fieldName}}$after

  + 指定したフィールドの変更後の値の取得・設定

## {{fieldName}}$error

  + {Error}
  + フィールドのエラーの取得・設定

## {{fieldName}}$field

  + {Field}
  + readonly
  + 指定したフィールドの取得

## $throwError

  + {Boolean}
  + 既定値 true
  + 値の設定時に検証をパスしなかった際の挙動を決定する
  + ture: 例外を発行する
  + false: $errorに設定する

## $ds

  + {Datasource}
  + 所属データソースの取得・設定
  
## $datasource

  + $dsのエイリアス

## $index

  + {Number}
  + readonly
  + データソースが設定されている場合に何行目なのかを返す

## $isCurrent

  + {Boolean}
  + 既定値 false
  + 現在行かどうかの取得・設定
  + データソースが設定されてない場合に設定すると例外

## $selected

  + {Boolean}
  + 既定値 false
  + 行が選択されているかどうかの設定・取得

## $deleted

  + {Boolean}
  + 削除フラグを取得・設定
  + removeと異なりデータソースから排除はされません
  + このフラグが追加されている場合は



# メソッド

## $reset ({String|Array} fieldName)

  + 変更後の値を破棄します
  + fieldNameを省略した場合はすべてのフィールドを対象とします
  + 複数のフィールドを指定する場合は配列を設定します

## $copy ()

  + {Row} 複製された行
  + 行を複製しデータソースに追加する
  + データソースが設定されてない場合は例外

## $remove()

  + {Boolean} 排除成功
  + データソースから行を取り除きます
  + データソースが設定されてない場合は例外



# イベント

## updated ({Array} names)

  + 値の更新した

## updated error ({Array} names)

  + 値の更新の失敗した

## selected ({Boolean} selected)

  + 選択されたもしくは解除された

## deleted ({Boolean} deleted)

  + 削除フラグが追加されたもしくは取り除かれた




















