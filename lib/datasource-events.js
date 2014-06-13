/*grunt-m2r*/

/**
 * 行のイベント
 */
exports.update = function update (ds) {
  return function onUpdated (updatedFields) {
    var row = this;
    ds.emit('updated', row, updatedFields);
  };
};

exports.selected = function selected (ds) {
  return function onSelected (selected) {
    var row = this;
    if (selected) {
      ds.emit('selected', row);
    } else {
      ds.emit('avoided', row);
    }
  };
};

exports.deleted = function deleted (ds) {
  return function onDeleted (deleted) {
    var row = this;
    if (deleted) {
      ds.emit('deleted', row);
    } else {
      ds.emit('revived', row);
    }
  };
};

exports.updatedError = function updatedError (ds) {
  return function onUpdatedError (errorFields) {
    var row = this;
    ds.emit('updated error', row, errorFields);
  };
};

/**
 * フィールドイベント
 */
exports.updatedName = function updatedName (ds) {
  return function onUpdatedName () {
    var field = this;
    ds.emit('updated name', field);
  };
};

exports.updatedCaption = function updatedCaption (ds) {
  return function onUpdatedCaption () {
    var field = this;
    ds.emit('updated caption', field);
  };
};

exports.updatedUndefinedTo = function updatedUndefinedTo (ds) {
  return function onUpdatedUndefinedTo (isFn) {
    var field = this;
    ds.emit('updated undefinedTo', field, isFn);
  };
};

exports.updatedDefaultTo = function updatedDefaultTo (ds) {
  return function onUpdatedDefaultTo (isFn) {
    var field = this;
    ds.emit('updated defaultTo', field, isFn);
  };
};

exports.addedValidation = function addedValidation (ds) {
  return function onUpdatedDefaultTo (validation) {
    var field = this;
    ds.emit('added validation', field, validation);
  };
};

exports.removedValidation = function removedValidation (ds) {
  return function onRemovedValidation (validation) {
    var field = this;
    ds.emit('removed validation', field, validation);
  };
};
