/*
 * Copyright(c) 2014 Yuki Kurata <yuki.kurata@gmail.com>
 * MIT Licensed
 */
/*grunt-m2r*/
'use strict';

/**
 * dependencies
 */
var Fields = require('./fields');
var Row = require('./row');
var dsEvents = require('./datasource-events');
var util = require('util');
var events = require('events');

/**
 * @method Datasource
 * @param  {Object} schema
 */
var Datasource = function Datasource (schema) {
  var self = this;
  var err;
  if (!schema || typeof schema !== 'object') {
    err = new TypeError('設定が存在しません');
    throw err;
  }
  self.setMaxListeners(0);

  var fields = new Fields(schema.fields);
  /**
   * フィールド
   */
  Object.defineProperty(self, 'fields', {value: fields});
  var fieldEvents = {
    'updated name'       : [dsEvents.updatedName(self)],
    'updated caption'    : [dsEvents.updatedCaption(self)],
    'updated undefinedTo': [dsEvents.updatedUndefinedTo(self)],
    'updated defaultTo'  : [dsEvents.updatedDefaultTo(self)],
    'added validation'   : [dsEvents.addedValidation(self)],
    'removed validation' : [dsEvents.removedValidation(self)]
  };
  Object.keys(fields).forEach(function (name) {
    fields[name]._events = fieldEvents;
  });

  /**
   * 行
   */
  Object.defineProperty(self, 'rows', {value: [], writable: true});

  /**
   * 現在行
   */
  Object.defineProperty(self, '_currentRow', {value: null, writable: true});

  // 継承元の行
  var baseRow = new Row(fields);
  baseRow.$ds = self;
  baseRow.$throwError = false;
  delete baseRow._before;
  delete baseRow._after;
  delete baseRow._errors;
  delete baseRow._status;
  baseRow.on('updated' , dsEvents.update(self));
  baseRow.on('selected', dsEvents.selected(self));
  baseRow.on('deleted', dsEvents.deleted(self));
  baseRow.on('updated error', dsEvents.updatedError(self));
  Object.defineProperty(self, '_baseRow', {value: baseRow});
};

util.inherits(Datasource, events.EventEmitter);


/**
 * (TODO)
 * 行にメソッドやアクセサを追加する事ができる
 * 動作はほとんどObject.defineProperty(row, name, desc)と同じ
 * 既に追加されているプロパティを上書きはできない
 * アクセサに監視対象を追加する事で、そのフィールドやオブジェクトが
 * 変更された時に通常のフィールド同じようにイベントを発行する
 * アクセサもwatchに入れる事ができる
 * @method extendRow
 * @param  {String} name
 * @param  {Object} desc
 */
Datasource.prototype.extendRow = function extendRow (name, desc) {
  if (typeof desc === 'function') {
    // メソッドの追加
  } else if (typeof desc === 'object' && desc !== null) {

    // アクセサの追加
    // get: function
    // set: function
    // watch: array 監視対象

  } else {
    var err = new Error('行の拡張に失敗しました');
    throw err;
  }
};


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
Object.defineProperty(Datasource.prototype, 'length', {
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
 * @param  {Object} before
 * @param  {Object} after
 * @param  {Object} errors
 * @param  {Object} status
 * @return {Row} row
 */
Datasource.prototype.add = function add (before, after, errors, status) {
  var fields = this.fields;
  var names = Object.keys(fields);
  var row = Object.create(this._baseRow, {
    _before: {value: {}, writable: true},
    _after : {value: {}, writable: true},
    _errors: {value: {}, writable: true},
    _status: {value: {}, writable: true}
  });

  // 一時的にイベントを発行しないようにする
  row._events = {};
  if (before || after) {
    before = before || {};
    after = after || {};
    errors = errors || {};
    names.forEach(function (f){
      row[f + '$before'] = f in before ? before[f] : fields[f].undefinedTo;
      if (f in after) {
        row[f + '$after'] = after[f];
      }
      if (f in errors) {
        row[f + '$error'] = errors[f];
      }
    });
    if (status) {
      if ('selected' in status) {
        row._status.selected = status.selected;
      }
      if ('deteletd' in status) {
        row._status.deleted = status.deleted;
      }
    }
  } else {
    names.forEach(function (name){
      row[name] = fields[name].defaultTo;
    });
  }
  this.rows.push(row);
  row.$ds = this;
  delete row._events; // 継承元のイベントを復活
  this.emit('added', row);
  return row;
};

/**
 * 複数の行を追加する
 * @method fill
 * @param  {Array}   fillData
 * @param  {Boolean} noCheck
 * @return {Number}  rowCount
 */
Datasource.prototype.fill = function fill (fillData, noCheck) {
  var err;
  if (!Array.isArray(fillData)) {
    err = new TypeError('データが不正です');
    throw err;
  }
  var i;
  var len = fillData.length;
  var data;
  var row;

  // チェック無し
  if (noCheck) {
    for(i = 0; i < len; i++) {
      data = fillData[i];
      row = Object.create(this._baseRow, {
        _before: {value: data.before || {}, writable: true},
        _after : {value: data.after  || {}, writable: true},
        _errors: {value: data.errors || {}, writable: true},
        _status: {value: data.status || {}, writable: true}
      });
      this.rows.push(row);
    }
  
  // チェックあり
  } else {
    var fields = this.fields;
    var names = Object.keys(fields);
    var rows = [];
    for(i = 0; i < len; i++) {
      data = fillData[i];
      row = fillCheck(this, fields, names, data);
      rows.push(row);
    }
    rows.forEach(function(row) {
      this.rows.push(row);
    });
  }
  this.emit('filled');
  return len;
};

/**
 * 流し込み時にデータを確認する
 * @method fillCheck
 * @param  {Datasource} ds
 * @param  {Object}     fields
 * @param  {Array}      names
 * @param  {Object}     data
 * @return {Row}        row
 */
function fillCheck (ds, fields, names, data) {
  var row = Object.create(ds._baseRow, {
    _before: {value: {}, writable: true},
    _after : {value: {}, writable: true},
    _errors: {value: {}, writable: true},
    _status: {value: {}, writable: true}
  });
  row._events = {}; // 一時的に通知をしない
  var before = data.before;
  if (before) {
    names.forEach(function (f){
      row[f + '$before'] = f in before ? before[f] : fields[f].undefinedTo;
    });
  }
  var after = data.after;
  if (after) {
    names.forEach(function (f){
      if (f in after) {
        row[f + '$after'] = after[f];
      }
    });
  }
  var error  = data.error;
  if (error) {
    names.forEach(function(f) {
      if (f in error) {
        row[f + '$error'] = error[f];
      }
    });
  }
  var status = data.status;
  if (status && typeof status === 'object') {
    var st = {};
    if ('selected' in status && typeof status.selected === 'boolean') {
      st.selected = status.selected;
    }
    if ('deleted' in status && typeof status.deleted === 'boolean') {
      st.deleted = status.deleted;
    }
    row._status = st;
  }
  delete row._events; // 継承元のイベント通知を復活
  return row;
}

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
  this.emit('removed', row);
  return row;
};

/**
 * 全ての行を排除する
 * @method removeAll
 */
Datasource.prototype.removeAll = function removeAll () {
  var len = this.rows.length;
  if (!len) {
    return;
  }
  this.rows = [];
  this.currentRow = null;

  this.emit('removed all', len);
};

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