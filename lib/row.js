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
  self._events = {};
  self._ds = null;
  /**
   * 内部で使用するキーは次の二つだけです
   *  {Datasource} ds      所属しているデータソース
   *  {Boolean}    deleted 行が削除予定である
   * 外部から行に関する情報を追加する際に使用します
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

  /**
   * 入力値が検証をパスしなかった場合に自動的に
   * _errorsに設定する場合はfalseにしてください
   * @property {Boolean} $throwError
   */
  self.$throwError = true;

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
  get: function () {return clone(this._errors);}
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
      if (this.$throwError) {
        field.valid(value);
      } else {
        try {
          field.valid(value);
        } catch (e) {
          this[name + '$error'] = e;
          return;
        }
      }
      if (name in this._after && compare(value, this._after[name])) {
        delete this._after[name];
      }
      this._before[name] = clone(value);
      this.emit('updated', [name]);
      this[name + '$error'] = null;
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
      if (this.$throwError) {
        field.valid(value);
      } else {
        try {
          field.valid(value);
        } catch(e) {
          this[name + '$error'] = e;
          return;
        }
      }
      if (name in this._before && compare(this._before[name], value)) {
        if (name in this._after) {
          delete this._after[name];
          this.emit('updated', [name]);
        }
      } else {
        if (!compare(this._after[name], value)) {
          this._after[name] = clone(value);
          this.emit('updated', [name]);
        }
      }
      this[name + '$error'] = null;
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
    get: function() { return this._errors[name] || null;},
    set: function(val) {
      if (val === null || val === void 0) {
        if (name in this._errors) {
          delete this._errors[name];
          this.emit('updated error', [name]);
        }
        return;
      }
      var message;
      var validName = '';
      var input;
      var err;
      if (val instanceof Error) {
        message = val.message;
        input = val.value;
        validName = val.name;

      } else if (typeof val === 'object') {
        if (typeof val.message === 'string') {
          message = val.message;
        } else {
          err = new Error('エラーを正しく設定できません');
          throw err;
        }
        if (typeof val.name === 'string') {
          validName = val.name;
        }
        if ('value' in val) {
          input = clone(val.value);
        }

      } else if (typeof val === 'string') {
        message = val;

      } else {
        err = new TypeError('エラーを正しく設定できません');
        throw err;
      }
      this._errors[name] = {
        message: message,
        name: validName,
        value: input
      };
      this.emit('updated error', [name]);
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
    return this._ds;
  },
  set: function (val) {
    if (val === null || val === void 0) {
      this._ds = null;
      return;
    }
    if (!(val instanceof DS)) {
      var err = new TypeError('データソースを指定してください');
      throw err;
    }
    this._ds = val;
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
 * プロパティ: インデックス
 * @property {Number} $index
 */
Object.defineProperty(Row.prototype, '$index', {
  get: function () {
    var ds = this.$ds;
    if (!ds) {
      return null;
    } else {
      return ds.rows.indexOf(this);
    }
  },
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
 * プロパティ：選択
 * @property {Boolean} $selected
 */
Object.defineProperty(Row.prototype, '$selected', {
  get: function () {return this._status.selected || false;},
  set: function (val) {
    var err;
    var oldVal = this._status.selected || false;
    if (typeof val !== 'boolean') {
      err = new TypeError('真偽値を設定してください');
      throw err;
    }
    if (oldVal !== val) {
      this._status.selected = val;
      this.emit('selected', val);
    }
  }
});

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

/**
 * 入力値をリセットする
 * @method reset
 * @param  {String} name
 * @return メソッドチェーン
 */
Row.prototype.$reset = function $reset (names) {
  var self = this;
  if (typeof names === 'string') {
    names = [names];
  } else if (names === void 0) {
    names = Object.keys(self._after);
  }
  var updatedFields = [];
  names.forEach(function (name) {
    if (name in self._after) {
      delete self._after[name];
      updatedFields.push(name);
    }
  });
  if (updatedFields.length) {
    self.emit('updated', updatedFields);
  }
};

/**
 * 複製する
 * @method $copy
 * @return {Row} newRow
 */
Row.prototype.$copy = function $copy () {
  var row;
  var ds = this.$datasource;
  var after = clone(this._before, this._after);
  if (ds) {
    row = ds.add(null, after, this._errors, this._status);

  } else {
    row = new Row(this.fields);
    var status = {
      selected: !!this.selected,
      deleted: !!this.deleted
    };
    row.$status = status;
    row._after = clone(this._before, this._after);
    row._error = clone(this._error);
  }
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



module.exports = exports = Row;