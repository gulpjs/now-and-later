'use strict';

function noop(){}

var defaultExts = {
  before: noop,
  after: noop,
  error: noop
};

function defaultExtensions(extensions){
  return {
    before: (extensions || defaultExts).before,
    after: (extensions || defaultExts).after,
    error: (extensions || defaultExts).error
  };
}

module.exports = {
  defaultExtensions: defaultExtensions,
  noop: noop
};
