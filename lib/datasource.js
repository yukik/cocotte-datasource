/*
 * @license
 * cocotte-datasource v0.3.0
 * Copyright(c) 2014 Yuki Kurata <yuki.kurata@gmail.com>
 * MIT Licensed
 */

/**
 * dependencies
 */
var sequential = require('cocotte-sequantial');
var events = require('events');
var helper = require('cocotte-helper');
var Row    = require('cocotte-row');
var Field  = require('cocotte-field');
var STATES = Row.STATES;

module.exports = Datasource;

/**
 * @method Datasource
 * @param  {Object} schema
 */
function Datasource (config) {
  var ds = this;
  var copied = helper.copy(config, ds);
  ds.Row = Row.type(ds.fields, createCallback(ds));
  ds.rows = initRows(ds, copied.rows);
}

/**
 * 行の更新用コールバック
 * @method createCallback
 * @param  {Datasource}  ds
 * @return {Function}    updated
 */
function createCallback(ds) {
  return function updated(fieldName) {
    var row = this;
    ds.emit('updated', row, fieldName);
  };
}

// 初期設定 行データ
function initRows (ds, rowsData) {
  var DsRow = ds.Row;
  return rowsData.map(function (r) {
    var config = {
      id   : r.id,
      state: r.state || STATES.EXISTS,
      data : r
    };
    return new DsRow(config);
  });
}

/**
 * プロパティ情報
 * @property {Object} properties
 */
Datasource.properties = {
  fields: {
    keyType: Field,
    required: true,
    description: ['フィールド']
  },
  rows: {
    arrayType: Object,
    copy: false,
    description: [
      '行データ',
      '変更後の値を設定する場合は、配列で[変更前, 変更後]をフィールドに指定します'
    ]
  }
};

helper.inherits(Datasource, events.EventEmitter);

/**
 * 行数
 * @property {Number} length
 */
Object.defineProperty(Datasource.prototype, 'length', {
  enumerable: true,
  get: function () {
    return this.rows.length;
  }
});

/**
 * 指定インデックスの行をオブジェクトにして返す
 * @method data
 * @param  {Number} index
 * @return {Object} data
 */
Datasource.prototype.data = function data (index) {
  var row = this.rows[index];
  return row ? Row.data(row) : null;
};


/**
 * 行を追加します
 * @method add
 * @param  {Object} data
 * @return {Row}    addedRow
 */
Datasource.prototype.add = function add (data) {
  data = data || {};
  var DsRow = this.Row;
  var config = {
    id   : data.id,
    state: data.state || STATES.ADDED,
    data : data
  };
  var row = new DsRow(config);
  this.rows.push(row);
  this.emit('added', row);
  return row;
};

/**
 * すべての行を保存します
 * @method save
 */
Datasource.prototype.save = function save() {
  var ds = this;
  ds.forEach(function(row){
    switch(row.state) {
    case STATES.ADDED:
      row.state = STATES.EXISTS;
      Row.save(row);
      break;
    case STATES.EXISTS:
      Row.save(row);
      break;
    case STATES.DELETED:
      ds.state = STATES.DETACHED;
      ds.remove(row);
      break;
    case STATES.DETACHED:
      ds.remove(row);
      break;
    }
  });
};

/**
 * 行を削除します
 * @method remove
 * @param  {Row}     row
 * @return {Boolean} removed
 */
Datasource.prototype.remove = function remove(row) {
  var idx = this.rows.indexOf(row);
  if (idx === -1) {
    return false;
  }
  this.rows.splice(idx, 1);
  this.emit('removed', row);
  return true;
};

/**
 * 全行を削除します
 * @method removeAll
 * @return {Number}  rowCount;
 */
Datasource.prototype.removeAll = function removeAll (){
  var ds = this;
  var rows = [].slice.call(ds.rows);
  ds.rows.length = 0;
  rows.forEach(function(row) {
    ds.emit('removed', row);
  });
  return rows.length;
};

/**
 * 行番号を指定して行を取得
 * 複数の行が同じ行番号の場合は、最初に一致した行を返します
 * @method find
 * @param  {String} id
 * @return {Row}    row
 */
Datasource.prototype.find = function find(id) {
  var rows = this.rows;
  for(var i = 0, len = rows.length; i < len; i++) {
    var row = rows[i];
    if (row.id === id) {
      return row;
    }
  }
  return null;
};

/**
 * 以下の順次処理用のメソッドを実装します
 * forEach
 * every
 * some
 * filter
 * map
 * reduce
 * reduceRight
 */
sequential(Datasource.prototype, 'rows');

// クライアント用
if (typeof window === 'object') {
  if (!window.Cocotte){
    window.Cocotte = {};
  }
  window.Cocotte.Datasource = Datasource;
}