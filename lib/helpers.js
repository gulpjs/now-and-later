'use strict';

function noop(){}

var defaultExts = {
  create: noop,
  before: noop,
  after: noop,
  error: noop
};

function defaultExtensions(extensions){
  extensions = extensions || {};
  return {
    create: extensions.create || defaultExts.create,
    before: extensions.before || defaultExts.before,
    after: extensions.after || defaultExts.after,
    error: extensions.error || defaultExts.error
  };
}

module.exports = {
  defaultExtensions: defaultExtensions,
  noop: noop
};
