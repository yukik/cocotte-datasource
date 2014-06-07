Row
==============

行オブジェクトのプロパティもしくはメソッドの説明

# $fields

  + {Object}
  + readonly
  + すべてのフィールドを取得

# $object

  + {Object}
  + readonly
  + 全フィールドの値を取得

# $before

  + {Object}
  + readonly
  + 全フィールドの変更前の値を取得

# $after

  + {Object}
  + readonly
  + 全フィールドの変更後の値を取得

# $error

  + {Object}
  + readonly
  + 全フィールドのエラーを取得

# $mofifiedNames 

  + {Array}
  + readonly
  + 変更されているフィールド名の一覧

# {{fieldName}}

  + 指定したフィールドの値の取得・設定

# {{fieldName}}$before

  + 指定したフィールドの変更前の値の取得・設定

# {{fieldName}}$after

  + 指定したフィールドの変更後の値の取得・設定

# {{fieldName}}$error

  + {Error}
  + フィールドのエラーの取得・設定

# {{fieldName}}$field

  + {Field}
  + readonly
  + 指定したフィールドの取得

# $ds

  + {Datasource}
  + 所属データソースの取得・設定
  
# $datasource

  + $dsのエイリアス

# $isCurrent

  + {Boolean}
  + 既定値 false
  + 現在行かどうかの取得・設定
  + データソースが設定されてない場合は例外

# $reset ({String|Array} fieldName)

  + 変更後の値を破棄します
  + fieldNameを省略した場合はすべてのフィールドを対象とします
  + 複数のフィールドを指定する場合は配列を設定します


# $copy ()

  + {Row} 複製された行
  + 行を複製しデータソースに追加する
  + データソースが設定されてない場合は例外

# $remove()

  + {Boolean} 排除成功
  + データソースから行を取り除きます
  + データソースが設定されてない場合は例外

# $deleted

  + {Boolean} 削除
  + 削除フラグを取得・設定
  + removeと異なりデータソースから排除はされません








