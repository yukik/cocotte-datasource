/*grunt-m2r*/
/*
 * Copyright(c) 2014 Yuki Kurata <yuki.kurata@gmail.com>
 * MIT Licensed
 */
'use strict';

/**
 * dependencies
 */
var Fields = require('./fields');
var Row = require('./row');
var util = require('util');
var events = require('events');

/**
 * @method Datasource
 * @param  {Object} schema
 */
var Datasource = function Datasource (schema) {
  var err;
  if (!schema || typeof schema !== 'object') {
    err = new TypeError('設定が存在しません');
    throw err;
  }

  var fields = new Fields(schema.fields);
  /**
   * フィールド
   */
  Object.defineProperty(this, 'fields', {value: fields});

  /**
   * 行
   */
  Object.defineProperty(this, 'rows', {value: [], writable: true});

  /**
   * 現在行
   */
  Object.defineProperty(this, '_currentRow', {value: null, writable: true});

  // 継承元の行
  var baseRow = new Row(fields);
  delete baseRow._before;
  delete baseRow._after;
  delete baseRow._errors;
  delete baseRow._status;
  Object.defineProperty(this, '_baseRow', {value: baseRow});
};

util.inherits(Datasource, events.EventEmitter);

/**
 * 現在行
 * @property currentRow
 * @type {Row}
 */
Object.defineProperty(Datasource.prototype, 'currentRow', {
  enumerable: true,
  get: function () {
    return this._currentRow;
  },
  set: function (row) {
    if (row === void 0) {
      row = null;
    }
    if (this._currentRow === row) {
      return;
    }
    if (row === null) {
      this._currentRow = null;
      this.emit('moved', null);
      return;
    }
    if (!~this.rows.indexOf(row)) {
      var err = new Error('所属している行ではありません');
      throw err;
    }
    this._currentRow = row;
    this.emit('moved', row);
  }
});

/**
 * 現在行のインデックス
 * @property currentIndex
 * @type {Row}
 */
Object.defineProperty(Datasource.prototype, 'currentIndex', {
  enumerable: true,
  get: function () {
    if (this._currentRow === null) {
      return -1;
    }
    return this.rows.indexOf(this._currentRow);
  },
  set: function (val) {
    var err;
    if (val === null || val === void 0) {
      val = -1;
    }
    if (typeof val !== 'number') {
      err = new Error('数字を指定してください');
      throw err;
    }
    var row = val === -1 ? null : this.rows[val];
    // 同じ行
    if (this._currentRow === row) {
      return;
    }

    // 未指定時
    if (row === null) {
      this._currentRow = null;
      this.emit('moved', null);
      return;
    }

    // 指定時
    if (row) {
      this._currentRow = row;
      this.emit('moved', row);
      return;
    }

    // エラー
    err = new Error('指定行はありません');
    throw err;
  }
});

/**
 * 行数を返す
 * @property {Number} length
 */
Object.defineProperty(Row.prototype, 'length', {
  enumerable: true,
  get: function () {return this.rows.length;}
});

/**
 * すべての行に対して、真であるかを調査する
 * @method forEach
 * @param  {Function} callback
 * @return {Boolean}
 */
Datasource.prototype.every = function every(callback) {
  var rows = this.rows;
  var len = rows.length;
  for(var i = 0; i < len; i++) {
    if (!callback(rows[i], i, rows)) {
      return false;
    }
  }
  return true;
};

/**
 * callbackを満たす行を配列で返す
 * @method filter
 * @param  {Function} callback
 * @return {Array}
 */
Datasource.prototype.filter = function filter (callback) {
  var rows = this.rows;
  var len = rows.length;
  var result = [];
  for(var i = 0; i < len; i++) {
    if (callback(rows[i], i, rows)) {
      result.push(rows[i]);
    }
  }
  return result;
};

/**
 * 各行に対して関数を呼び出します
 * @method forEach
 * @param  {Function} callback
 */
Datasource.prototype.forEach = function forEach(callback) {
  var rows = this.rows;
  var len = rows.length;
  for(var i = 0; i < len; i++) {
    callback(rows[i], i, rows);
  }
};

/**
 * 各行から新しい配列を作成します
 * @method map
 * @param  {Function} callback
 */
Datasource.prototype.map = function map(callback) {
  var rows = this.rows;
  var len = rows.length;
  var result = [];
  for(var i = 0; i < len; i++) {
    result.push(callback(rows[i], i, rows));
  }
  return result;
};

/**
 * 各行から値を計算します
 * @method reduce
 * @param  {Function} callback
 * @param  {Mixed}    initial
 * @return {Mixed}    result
 */
Datasource.prototype.reduce = function reduce (callback, initial) {
  var rows = this.rows;
  var len = rows.length;
  for(var i = 0; i < len; i++) {
    initial = callback(initial, rows[i]);
  }
  return initial;
};

/**
 * 各行をインデックスの降順で値を計算します
 * @method reduceRight
 * @param  {Function} callback
 * @param  {Mixed}    initial
 * @return {Mixed}    result
 */
Datasource.prototype.reduceRight = function reduceRight (callback, initial) {
  var rows = this.rows;
  var len = rows.length;
  for(var i = len - 1; -1 < i; i--) {
    initial = callback(initial, rows[i]);
  }
  return initial;
};

/**
 * いずれかの行に対して、真であるかを調査する
 * @method some
 * @param  {Function} callback
 * @return {Boolean}
 */
Datasource.prototype.some = function some(callback) {
  var rows = this.rows;
  var len = rows.length;
  for(var i = 0; i < len; i++) {
    if (callback(rows[i], i, rows)) {
      return true;
    }
  }
  return false;
};

/**
 * 新しい行を追加する
 * @method add
 * @param  {Object} data
 * @return {Row} row
 */
Datasource.prototype.add = function add (data) {
  var dsUpdateListener  = updateListener(this);
  var dsDeletedListener = deletedListener(this);
  var dsErrorListener   = errorListener(this);
  var row = Object.create(this._baseRow, {
    _before: {value: {}},
    _after : {value: {}},
    _errors: {value: {}},
    _status: {value: {
      dsUpdateListener : dsUpdateListener,
      dsDeletedListener: dsDeletedListener,
      dsErrorListener  : dsErrorListener
    }}
  });
  row.$ds = this;
  if (data) {
    Object.keys(data).forEach(function (f){
      row[f + '$before'] = data[f];
    });
  } else {
    var fields = this.fields;
    Object.keys(fields).forEach(function (name){
      row[name] = fields[name].defaultTo;
    });
  }
  this.rows.push(row);
  row.on('updated' , dsUpdateListener);
  row.on('deleted', dsDeletedListener);
  row.on('error', dsErrorListener);
  this.emit('added', row);
  return row;
};

/**
 * 指定行もしくは現在行を排除する
 * @method remove
 * @param  {Row} row
 * @return {Row} removedRow
 */
Datasource.prototype.remove = function remove (row) {
  row = row || this.currentRow;
  var len = this.rows.length;
  this.rows = this.rows.filter(function (r) {return r !== row;});
  if (len === this.rows.length) {
    var err = new Error('所属する行を指定してください');
    throw err;
  }
  if (this.currentRow === row) {
    this.currentRow = null;
  }
  row.$ds = null;
  row.removeListener('updated', row._status.dsUpdateListener);
  row.removeListener('deleted', row._status.dsDeletedListener);
  row.removeListener('error', row._status.dsErrorListener);
  delete row._status.dsUpdateListener;
  delete row._status.dsDeletedListener;
  this.emit('removed', row);
  return row;
};


/**
 * 行のイベントを捕捉し、データソースのイベントを発行します
 * (リスナーは行がデータソースから排除された時に捕捉をしないように)
 */
function updateListener(ds) {
  return function dsUpdateListener (name) {
    var row = this;
    ds.emit('updated', row, name);
  };
}
function deletedListener(ds) {
  return function dsDeletedListener (deleted) {
    var row = this;
    if (deleted) {
      ds.emit('deleted', row);
    } else {
      ds.emit('revived', row);
    }
  };
}
function errorListener(ds) {
  return function dsErrorListener (name) {
    var row = this;
    ds.emit('error', row, name);
  };
}

/**
 * 最初の行に移動
 * @method first
 * @return {Row} row
 */
Datasource.prototype.first = function first () {
  try {
    this.currentIndex = 0;
    return this.currentRow;
  } catch (e) {}
  return null;
};

/**
 * 前行に移動
 * @method back
 * @return {Row} row
 */
Datasource.prototype.back = function back () {
  try {
    this.currentIndex--;
    return this.currentRow;
  } catch (e) {}
  return null;
};

/**
 * 次行に移動
 * @method next
 * @return {Row} row
 */
Datasource.prototype.next = function next () {
  try {
    this.currentIndex++;
    return this.currentRow;
  } catch (e) {}
  return null;
};

/**
 * 最後の行に移動
 * @method last
 * @return {Row} row
 */
Datasource.prototype.last = function last () {
  try {
    this.currentIndex = this.rows.length - 1;
    return this.currentRow;
  } catch (e) {}
  return null;
};

module.exports = exports = Datasource;