Datasource
==============

データソースオブジェクトのプロパティもしくはメソッドの説明  
データソースは複数の行を保有し、
どの行が現在行であるかを設定する事が出来ます 

# 作成
## new Datasource(schema)
  
  + schema {Object}
    + name    {String} データソース名。省略可能
    + caption {String} 表示名。省略可能
    + fields {Object} フィールド一覧。必須
        + 名称をキー、設定を値とします
        + 設定 {Object|String}
        + 文字列では、`{type: fieldTypeName}`と指定したことと同じとなります
        + オブジェクトでは、指定したフィールド型による様々なオプションを設定する事が出来ます
        + 例えば、最大文字長を指定する文字列の場合は、`{type: 'cocotte-field-text', max: 10}`となります
        + `cocotte-field-text`は、npmなどでで事前にインストールされているモジュールです
        + モジュールを追加する事で、フィールドの型を増やす事が出来ます



# プロパティ

## name {String}

  + データソース名

## caption {String}

  + 表示名

## fields {Fields}

  + フィールド

## currentRow {Row}

  + 現在行を取得・設定する事できます
  + nullを設定することで、現在行を未定にする事が出来ます

## currentIndex {Number}

  + 現在行のインデックスを取得・設定することができます
  + 現在行が未定の場合は-1が設定されています

## length {Number}

  + 行数を返します



# 順次処理

行を順次取得し、それぞれに対してcallbackを実行します  
この処理は、現在行を移動する事はありません

## every(callback)

  + すべての行に対してcallbackの結果が真であるかを調べます
  + callbackの第一引数に行を、第二引数にインデックスを、第三引数に行全体の配列を返します

## filter (callback)

  + callbackを満たす行を配列で返します
  + callbackの第一引数に行を、第二引数にインデックスを、第三引数に行全体の配列を返します

## forEach(callback)

  + 全行を順次取得し、callbackを実行します
  + callbackの第一引数に行を、第二引数にインデックスを、第三引数に行全体の配列を返します

## map(callback)

  + 各行から新しい配列を作成します
  + callbackの第一引数に行を、第二引数にインデックスを、第三引数に行全体の配列を返します

## reduce(callback, initial)

  + 各行から値を計算します
  + callbackには二つの引数が渡されます
  + callbackの戻り値が次の第一引数になります。
  + 第二引数に各行が渡されます
  + initialは一番最初の行を処理する際の第一引数です
  + initialを省略した場合はundefinedです

## reduceRight(callback, initial)

  + 各行をインデックスの降順で値を計算します
  + それ以外はreduceと同じです

## some(callback)

  + いずれかの行に対してcallbackの結果が真であるかを調べます



# 行の操作

## add({Object} before)

  + 行を追加します
  + beforeに編集前の値を設定します
  + beforeを省略する事も出来ます
  + 戻り値は追加された行です

## fill (fillData, noCheck)

  + 複数の行を一気に追加します
  + fillDataの形式は次の通りです
    + 

## remove(row)

  + 指定行をデータソースから排除します
  + rowを省略した場合は現在行です

## removeAll()

  + 全ての行をデータソースから排除します



# 現在行の移動

## first()

  + 最初の行に移動します

## next()

  + 次の行に移動します

## back()

  + 前の行に移動します

## last()

  + 最後の行に移動します



# イベント

## moved

  + 現在行が移動した

## added (row)

  + 行が追加された

## updated (row, names)

  + 値が更新された

## selected (row)

  + 行に選択された

## avoided (row)

  + 行の選択が解除された

## deleted (row)

  + 行に削除フラグが追加された

## revived (row)

  + 行の削除フラグが取り除かれた

## removed (row)

  + 行がデータソースから取り除かれた
  + このイベントはremoveメソッドによりイベントが発行されます

## removedAll ()

  + すべての行がデータソースから取り除かれた
  + このイベントはremoveAllメソッドによりイベントが発行されます

## updated error (row, name)

  + エラー内容が変更された

## updated name (field)

  + 名称が変更された

## updated caption (field)

  + 表示名が変更された

## updated undefinedTo (field, isFn)

  + undefindToの値が変更された
  + 第一引数は、値が関数であるかどうか

## updated defaultTo (field, isFn)

  + defaultToの値が変更された
  + 第一引数は、値が関数であるかどうか

## added validation (field, validation)

  + 検証が追加された

## removed validation (field, validation)

  + 検証が削除された
