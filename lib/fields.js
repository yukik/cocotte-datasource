/*grunt-m2r*/
'use strict';

/**
 * alias
 */
var reg = /^[a-z]([-_0-9a-z]{1,30}[0-9a-z])?$/;

/**
 * フィールド群
 * @method Fields
 * @param  {Object} fields
 */
var Fields = function Fields (fields) {
  var self = this;
  var err;

  if (!fields || typeof fields !== 'object') {
    err = new TypeError('フィールド設定が存在しません');
    throw err;
  }

  Object.keys(fields).forEach(function (name) {
    if (!reg.test(name)) {
      err = new Error('フィールド名が不正です');
      throw err;
    }
    var config = fields[name];
    if (typeof config === 'string') {
      config = {type: config};
    } else if (typeof config !== 'object') {
      err = new Error('フィールド設定が間違っています');
      throw err;
    }
    if (typeof config.type !== 'string' || !reg.test(config.type)) {
      err = new Error('フィールドタイプが不明です');
      throw err;
    }
    var Field = require(config.type); /*module require*/
    self[name] = new Field(config);
  });
};

module.exports = exports = Fields;