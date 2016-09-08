define('dummy/tests/helpers/store', ['exports', 'ember', 'ember-data', 'dummy/tests/helpers/owner', 'smack-ember-adapters/serializers/ls-serializer'], function (exports, _ember, _emberData, _dummyTestsHelpersOwner, _smackEmberAdaptersSerializersLsSerializer) {
  exports['default'] = setupStore;

  function setupStore(options) {
    var container = undefined,
        registry = undefined,
        owner = undefined;
    var env = {};
    options = options || {};

    if (_ember['default'].Registry) {
      registry = env.registry = new _ember['default'].Registry();
      owner = _dummyTestsHelpersOwner['default'].create({
        __registry__: registry
      });
      container = env.container = registry.container({ owner: owner });
      owner.__container__ = container;
    } else {
      container = env.container = new _ember['default'].Container();
      registry = env.registry = container;
    }

    env.replaceContainerNormalize = function replaceContainerNormalize(fn) {
      if (env.registry) {
        env.registry.normalize = fn;
      } else {
        env.container.normalize = fn;
      }
    };

    var adapter = env.adapter = options.adapter || '-default';
    delete options.adapter;

    if (typeof adapter !== 'string') {
      env.registry.register('adapter:-default', adapter);
      adapter = '-default';
    }

    for (var prop in options) {
      registry.register('model:' + _ember['default'].String.dasherize(prop), options[prop]);
    }

    registry.register('service:store', _emberData['default'].Store.extend({ adapter: adapter }));

    registry.optionsForType('serializer', { singleton: false });
    registry.optionsForType('adapter', { singleton: false });

    registry.register('serializer:-default', _smackEmberAdaptersSerializersLsSerializer['default']);

    env.store = container.lookup('service:store');
    env.serializer = container.lookup('serializer:-default');
    env.adapter = container.lookup('adapter:-default');

    return env;
  }

  var transforms = {
    'boolean': _emberData['default'].BooleanTransform.create(),
    'date': _emberData['default'].DateTransform.create(),
    'number': _emberData['default'].NumberTransform.create(),
    'string': _emberData['default'].StringTransform.create()
  };

  // Prevent all tests involving serialization to require a container
  _emberData['default'].JSONSerializer.reopen({
    transformFor: function transformFor(attributeType) {
      return this._super(attributeType, true) || transforms[attributeType];
    }
  });
});