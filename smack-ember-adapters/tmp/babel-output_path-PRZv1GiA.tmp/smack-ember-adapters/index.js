define('smack-ember-adapters/index', ['exports', 'smack-ember-adapters/adapters/ls-adapter', 'smack-ember-adapters/serializers/ls-serializer'], function (exports, _smackEmberAdaptersAdaptersLsAdapter, _smackEmberAdaptersSerializersLsSerializer) {
  'use strict';

  exports.LSAdapter = _smackEmberAdaptersAdaptersLsAdapter['default'];
  exports.LSSerializer = _smackEmberAdaptersSerializersLsSerializer['default'];
  exports['default'] = _smackEmberAdaptersAdaptersLsAdapter['default'];
});