/*grunt-m2r*/
'use strict';

/**
 * dependencies
 */
var compare = require('cocotte-compare');
var util = require('util');
var events = require('events');

/**
 * alias
 */
var clone = require('cocotte-clone');
var DS;

/**
 * 相互参照になるため、遅延リクエストとする
 * @method requireDS
 */
function requireDS () {
  if (!DS) {
    // 文字連結にしてRequireJSでも遅延させる
    DS = require('' + './datasource');
  }
}

/**
 * 行
 * @method Row
 * @param  {Object} fields
 */
var Row = function Row (fields) {
  requireDS();
  var self = this;
  self.$fields = fields; // $fields
  self._before = {};     // datasourceからは再設定
  self._after  = {};     // datasourceからは再設定
  self._errors = {};     // datasourceからは再設定
  /**
   * 内部で使用するキーは次の二つだけです
   *  {Datasource} ds      所属しているデータソース
   *  {Boolean}    deleted 行が削除予定である
   * 外部から行に関する情報を追加する際に使用します
   * その際に、キーおよび値に制限はありません
   */
  self._status = {};     // datasourceからは再設定

  // $object -> prototype
  // $before -> prototype
  // $after  -> prototype
  // $error  -> prototype

  Object.keys(fields).forEach(function (name) {
    var field = fields[name];
    defineValue (self, name, field); // {{fieldName}}
    defineBefore(self, name, field); // {{fieldName}}$before
    defineAfter (self, name, field); // {{fieldName}}$after
    defineError (self, name);        // {{fieldName}}$error
    defineField (self, name, field); // {{fieldName}}$field
  });

  // $datasource, $ds - prototype
  // $isCurrent - prototype
  // $reset   - prototype
  // $copy    - prototype
  // $remove  - prototype
  // $deleted - prototype

  Object.preventExtensions(this);
};

util.inherits(Row, events.EventEmitter);

/**
 * プロパティ：すべてのフィールドの値
 * @property {Object} $object
 */
Object.defineProperty(Row.prototype, '$object', {
  get: function () {
    var self = this;
    return Object.keys(self.$fields).reduce(function (x, y){
      x[y] = clone(self[y]);
      return x;
    }, {});
  }
});

/**
 * 変更前のフィールドのすべての値
 * @property {Object} $before
 */
Object.defineProperty(Row.prototype, '$before', {
  get: function () {return clone(this._before);}
});

/**
 * 変更後のフィールドのすべての値
 * @property {Object} $after
 */
Object.defineProperty(Row.prototype, '$after', {
  get: function () {return clone(this._after);}
});

/**
 * エラーの存在するフィールドのすべてのエラー文
 * @property {Object} $error
 */
Object.defineProperty(Row.prototype, '$error', {
  get: function () {return clone(this._error);}
});

/**
 * 変更されているフィールド
 * @property {Object} $modifiedNames
 */
Object.defineProperty(Row.prototype, '$modifiedNames', {
  get: function () {
    return Object.keys(this._after);
  }
});


/**
 * プロパティ：値
 * @method defineValue
 * @param  {Row}    row
 * @param  {String} name
 */
function defineValue (row, name, field) {
  Object.defineProperty(row, name, {
    enumerable: true,
    get: function () {
      return name in this._after  ? clone(this._after[name])  :
             name in this._before ? clone(this._before[name]) :
             field.undefinedTo;
    },
    set: function (value) {
      this[name + '$after'] = value;
    }
  });
}

/**
 * プロパティ：変更前の値
 * @method defineBefore
 * @param  {Row}    row
 * @param  {String} name
 */
function defineBefore (row, name, field) {
  Object.defineProperty(row, name + '$before', {
    get: function () {
      return name in this._before ? clone(this._before[name]) : field.undefinedTo;
    },
    set: function (value) {
      field.valid(value);
      if (name in this._after && compare(value, this._after[name])) {
        delete this._after[name];
      }
      this._before[name] = clone(value);
      this.emit('updated', name);
    }
  });
}

/**
 * プロパティ：変更後の値
 * @method defineAfter
 * @param {Row}    row
 * @param {String} name
 * @param {Field}  field
 */
function defineAfter (row, name, field) {
  Object.defineProperty(row, name + '$after', {
    get: function () {
      return name in this._after ? clone(this._after[name]) : field.undefinedTo;
    },
    set: function (value) {
      if (value === null || value === void 0) {
        value = field.undefinedTo;
      }
      field.valid(value);
      if (name in this._before && compare(this._before[name], value)) {
        if (name in this._after) {
          delete this._after[name];
          this.emit('updated', name);
        }
      } else {
        if (!compare(this._after[name], value)) {
          this._after[name] = clone(value);
          this.emit('updated', name);
        }
      }
    }
  });
}

/**
 * プロパティ：エラー
 * @method defineError
 * @param  {Row}    row
 * @param  {String} name
 */
function defineError (row, name) {
  Object.defineProperty(row, name + '$error', {
    get: function() { return this._error[name];},
    set: function(val) {
      if (val === null) {
        delete this._error[name];
        return;
      }
      if (!(val instanceof Error)) {
        var err = new TypeError('エラーを正しく設定できません');
        throw err;
      }
      this._error[name] = val;
    }
  });
}

/**
 * プロパティ：フィールド
 * @method defineField
 * @param {Row}    row
 * @param {String} name
 * @param {Field}  field
 */
function defineField (row, name, field) {
  Object.defineProperty(row, name + '$field', {
    get: function () {
      return field;
    }
  });
}

/**
 * プロパティ：データソース
 * @property {Datasource} $ds
 */
Object.defineProperty(Row.prototype, '$ds', {
  get: function () {
    return this._status.ds || null;
  },
  set: function (val) {
    if (val === null || val === void 0) {
      delete this._status.ds;
      return;
    }
    if (!(val instanceof DS)) {
      var err = new TypeError('データソースを指定してください');
      throw err;
    }
    this._status.ds = val;
  }
});

/**
 * プロパティ：データソース
 * @property {Datasource} $datasource
 */
Object.defineProperty(Row.prototype, '$datasource', {
  get: function () {return this.$ds;},
  set: function (val) {this.$ds = val;}
});

/**
 * プロパティ：現在行
 * @property {Boolean} defineIsCurrent
 */
Object.defineProperty(Row.prototype, '$isCurrent', {
  get: function () {
    var ds = this.$ds;
    return ds && ds.currentRow === this;
  },
  set: function (val) {
    var err;
    if (typeof val !== 'boolean') {
      err = new TypeError('真偽値を設定してください');
      throw err;
    }
    var ds = status.ds;
    if (!ds) {
      err = new Error('データソースが設定されていません');
      throw err;
    }
    if (val) {
      ds.currentRow = this;
    } else if (ds.currentRow === this) {
      ds.currentRow = null;
    }
  }
});

/**
 * 入力値をリセットする
 * @method reset
 * @param  {String} name
 * @return メソッドチェーン
 */
Row.prototype.$reset = function $reset (names) {
  if (typeof names === 'string') {
    names = [names];
  } else if (names === void 0) {
    names = Object.keys(this._after);
  }
  names.forEach(function (name) {
    delete this._after[name];
  });
};

/**
 * 複製する
 * @method $copy
 * @return {Row} newRow
 */
Row.prototype.$copy = function $copy () {
  var row;
  var ds = this.$datasource;
  
  if (ds) {
    row = ds.add();
  } else {
    row = new Row(this.fields);
    var status = {
      ds: ds,
      deleted: this.deleted
    };
    row.$status = status;
  }
  var values = this.$object;
  Object.keys(values).forEach(function(name) {
    row[name] = values[name];
  });
  var error = this.$error;
  Object.keys(error).forEach(function(name) {
    row[name + '$error'] = error[name];
  });

  return row;
};

/**
 * 排除する
 * @method $remove
 */
Row.prototype.$remove = function $remove () {
  var ds = this.$datasource;
  var err;
  if (!ds) {
    err = new Error('データソースに所属していません');
  }
  ds.remove(this);
};

/**
 * プロパティ：削除
 * @property {Boolean} $deleted
 */
Object.defineProperty(Row.prototype, '$deleted', {
  get: function () {return this._status.deleted || false;},
  set: function (val) {
    var err;
    var oldVal = this._status.deleted || false;
    if (typeof val !== 'boolean') {
      err = new TypeError('真偽値を設定してください');
      throw err;
    }
    if (oldVal !== val) {
      this._status.deleted = val;
      this.emit('deleted', val);
    }
  }
});

module.exports = exports = Row;