define('dummy/tests/helpers/destroy-app', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = destroyApp;

  function destroyApp(application) {
    _ember['default'].run(application, 'destroy');
  }
});
define('dummy/tests/helpers/fixtures', ['exports'], function (exports) {
  exports['default'] = {
    'list': {
      records: {
        'l1': { id: 'l1', name: 'one', done: true, items: ['i1', 'i2'] },
        'l2': { id: 'l2', name: 'two', done: false, items: [] },
        'l3': { id: 'l3', name: 'three', done: false, items: [] }
      }
    },

    'item': {
      records: {
        'i1': { id: 'i1', name: 'one', list: 'l1' },
        'i2': { id: 'i2', name: 'two', list: 'l1' }
      }
    },

    'order': {
      records: {
        'o1': { id: 'o1', name: 'one', done: true, hours: ['h1', 'h2'] },
        'o2': { id: 'o2', name: 'two', done: false, hours: [] },
        'o3': { id: 'o3', name: 'three', done: true, hours: ['h3', 'h4'] },
        'o4': { id: 'o4', name: 'four', done: true, hours: [] }
      }
    },

    'hour': {
      records: {
        'h1': { id: 'h1', name: 'one', amount: 4, order: 'o1' },
        'h2': { id: 'h2', name: 'two', amount: 3, order: 'o1' },
        'h3': { id: 'h3', name: 'three', amount: 2, order: 'o3' },
        'h4': { id: 'h4', name: 'four', amount: 1, order: 'o3' }
      }
    }
  };
});
define('dummy/tests/helpers/module-for-acceptance', ['exports', 'qunit', 'dummy/tests/helpers/start-app', 'dummy/tests/helpers/destroy-app'], function (exports, _qunit, _dummyTestsHelpersStartApp, _dummyTestsHelpersDestroyApp) {
  exports['default'] = function (name) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    (0, _qunit.module)(name, {
      beforeEach: function beforeEach() {
        this.application = (0, _dummyTestsHelpersStartApp['default'])();

        if (options.beforeEach) {
          options.beforeEach.apply(this, arguments);
        }
      },

      afterEach: function afterEach() {
        (0, _dummyTestsHelpersDestroyApp['default'])(this.application);

        if (options.afterEach) {
          options.afterEach.apply(this, arguments);
        }
      }
    });
  };
});
define('dummy/tests/helpers/owner', ['exports', 'ember'], function (exports, _ember) {

  var Owner = undefined;

  if (_ember['default']._RegistryProxyMixin && _ember['default']._ContainerProxyMixin) {
    Owner = _ember['default'].Object.extend(_ember['default']._RegistryProxyMixin, _ember['default']._ContainerProxyMixin);
  } else {
    Owner = _ember['default'].Object.extend();
  }

  exports['default'] = Owner;
});
define('dummy/tests/helpers/resolver', ['exports', 'ember/resolver', 'dummy/config/environment'], function (exports, _emberResolver, _dummyConfigEnvironment) {

  var resolver = _emberResolver['default'].create();

  resolver.namespace = {
    modulePrefix: _dummyConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _dummyConfigEnvironment['default'].podModulePrefix
  };

  exports['default'] = resolver;
});
define('dummy/tests/helpers/smack-model-fixtures', ['exports'], function (exports) {
  exports['default'] = {
    'connection': {
      records: {}
    },

    'compilation-unit': {
      records: {}
    },

    'execute-event': {
      records: {}
    },

    'execute-anonymous-event': {
      records: {}
    }
  };
});
define('dummy/tests/helpers/start-app', ['exports', 'ember', 'dummy/app', 'dummy/config/environment'], function (exports, _ember, _dummyApp, _dummyConfigEnvironment) {
  exports['default'] = startApp;

  function startApp(attrs) {
    var application = undefined;

    var attributes = _ember['default'].merge({}, _dummyConfigEnvironment['default'].APP);
    attributes = _ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    _ember['default'].run(function () {
      application = _dummyApp['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }
});
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
define('dummy/tests/integration/adapters/smack-models-test', ['exports', 'dummy/tests/helpers/store', 'ember', 'dummy/tests/helpers/smack-model-fixtures', 'ember-data', 'smack-ember-adapters/adapters/ls-adapter', 'smack-ember-adapters/adapters/smackHooks', 'smack-ember-adapters/models/connection', 'smack-ember-adapters/models/compilation-unit', 'smack-ember-adapters/models/execute-event', 'smack-ember-adapters/models/execute-anonymous-event', 'smack-ember-adapters/models/test-datum', 'qunit'], function (exports, _dummyTestsHelpersStore, _ember, _dummyTestsHelpersSmackModelFixtures, _emberData, _smackEmberAdaptersAdaptersLsAdapter, _smackEmberAdaptersAdaptersSmackHooks, _smackEmberAdaptersModelsConnection, _smackEmberAdaptersModelsCompilationUnit, _smackEmberAdaptersModelsExecuteEvent, _smackEmberAdaptersModelsExecuteAnonymousEvent, _smackEmberAdaptersModelsTestDatum, _qunit) {
  var run = _ember['default'].run;
  var get = _ember['default'].get;
  var set = _ember['default'].set;

  var env = undefined,
      store = undefined;

  (0, _qunit.module)('integration/adapters/ls-adapter - LSAdapter', {
    beforeEach: function beforeEach() {
      localStorage.setItem('DS.LSAdapter', JSON.stringify(_dummyTestsHelpersSmackModelFixtures['default']));

      env = (0, _dummyTestsHelpersStore['default'])({
        'connection': _smackEmberAdaptersModelsConnection['default'],
        'compilation-unit': _smackEmberAdaptersModelsCompilationUnit['default'],
        'execute-event': _smackEmberAdaptersModelsExecuteEvent['default'],
        'execute-anonymous-event': _smackEmberAdaptersModelsExecuteAnonymousEvent['default'],
        'test-datum': _smackEmberAdaptersModelsTestDatum['default'],
        adapter: _smackEmberAdaptersAdaptersLsAdapter['default']
      });
      store = env.store;
    },

    afterEach: function afterEach() {
      run(store, 'destroy');
      _smackEmberAdaptersAdaptersSmackHooks['default']._ns = {};
    }
  });

  (0, _qunit.test)('exists through the store', function (assert) {
    var lsAdapter = store.adapterFor('-default');
    var lsSerializer = store.serializerFor('-default');
    assert.ok(lsAdapter, 'LSAdapter exists');
    assert.ok(lsSerializer, 'LSSerializer exists');
  });

  // test('connection create and find - hook', function(t) {
  //   t.expect(7);
  //   // const list = run(store, 'createRecord', 'list', {name: 'Rambo'});
  //   var connection = run(store, 'createRecord', 'connection', { username : 'dude', password : 'IL0veMum' });
  //   t.equal(get(connection, 'username'), 'dude', 'username unchanged');
  //   t.equal(get(connection, 'password'), 'IL0veMum', 'password unchanged');
  //   t.ok(!!get(connection, 'session'), 'session id created');

  //   const done = t.async();
  //   run(store, 'findRecord', 'connection', get(connection, 'id')).then(con => {
  //     t.equal(get(con, 'id'), get(connection, 'id'), 'id unchanged');
  //     t.equal(get(con, 'username'), 'dude', 'username unchanged');
  //     t.notOk(get(con, 'password'), 'password hidden');
  //     t.equal(get(con, 'session'), get(connection, 'session'), 'session unchanged');
  //     done();
  //   });
  // });

  (0, _qunit.test)('compilation-unit create, update, execute, execute anonymous and delete - hook', function (t) {
    // t.expect();

    // create
    var cuc = run(store, 'createRecord', 'compilation-unit', { name: 'sum', source: 'pack math; func add(a, b) { ret a + b; } func sub(a, b) { ret a - b; }' });
    var id = get(cuc, 'id');

    var done = t.async();
    run(store, 'findRecord', 'compilation-unit', get(cuc, 'id')).then(function (cuf) {
      t.equal(get(cuf, 'id'), get(cuc, 'id'), 'id unchanged');
      t.equal(get(cuf, 'name'), 'sum', 'name unchanged');
      t.equal(get(cuf, 'source'), 'pack math; func add(a, b) { ret a + b; } func sub(a, b) { ret a - b; }', 'source unchanged');
      t.equal(get(cuf, 'pack'), 'math', 'package name set');
      t.deepEqual(get(cuf, 'funcNames'), ['add', 'sub'], 'function names set');
      // t.equal(typeof SmackHooks.getFuncNamespace('math').add, 'function', 'add function created in the math namespace');
      // t.equal(typeof SmackHooks.getFuncNamespace('math').sub, 'function', 'sub function created in the math namespace');

      cuc = cuf;
      done();
    });

    // // update
    // run(cuc, 'set', 'source', 'pack math; func add(a, b) { ret a + b; } func error() { nonexistent.param = 1; }');

    // run(cuc, 'save').then(cuu => {
    //   t.equal(get(cuu, 'id'), get(cuc, 'id'), 'id unchanged');
    //   t.equal(get(cuu, 'name'), 'sum', 'name unchanged');
    //   t.equal(get(cuu, 'source'), 'pack math; func add(a, b) { ret a + b; } func error() { nonexistent.param = 1; }', 'source updated');
    //   t.equal(get(cuu, 'pack'), 'math', 'package name unchanged');
    //   t.deepEqual(get(cuu, 'funcNames'), ['add', 'error'], 'function names updated');
    //   t.equal(typeof SmackHooks.getFuncNamespace('math').add, 'function', 'add function still in the math namespace');
    //   t.equal(typeof SmackHooks.getFuncNamespace('math').sub, 'undefined', 'sub function removed from the math namespace');
    //   done();
    // });

    // // execute
    // var ee = run(store, 'createRecord', 'execute-event',
    //     { name : 'math.add', arguments : [1, 1] });
    // t.equal(get(ee, 'result'), 2, 'execution result');
    // t.ok(get(ee, 'success'), 'success status');

    // ee = run(store, 'createRecord', 'execute-event',
    //     { name : 'math.error' });
    // t.notOk(get(ee, 'success'), 'success status');
    // t.ok(get(ee, 'errorMessage'), 'error message');

    // // execute anonymous
    // var eae = run(store, 'createRecord', 'execute-anonymous-event',
    //     { source : 'c = a + b', arguments : { a : 1, b : 1, c : 0 }});
    // t.deepEqual(get(eae, 'result'), { a : 1, b : 1, c : 2 }, 'execution result');
    // t.ok(get(eae, 'success'), 'success status');

    // eae = run(store, 'createRecord', 'execute-anonymous-event',
    //     { source : 'nonexistent.property = 1', arguments : {}});
    // t.notOk(get(eae, 'success'), 'success status');
    // t.ok(get(eae, 'errorMessage'), 'error message');

    // // update again
    // run(cuc, 'set', 'source', 'pack mathematics; func add(a, b) { ret a + b; }');

    // run(cuc, 'save').then(cuu => {
    //   t.equal(get(cuu, 'id'), get(cuc, 'id'), 'id unchanged');
    //   t.equal(get(cuu, 'name'), 'sum', 'name unchanged');
    //   t.equal(get(cuu, 'source'), 'pack mathematics; func add(a, b) { ret a + b; }', 'source updated');
    //   t.equal(get(cuu, 'pack'), 'mathematics', 'package name updated');
    //   t.deepEqual(get(cuu, 'funcNames'), ['add'], 'function names unchanged');
    //   t.equal(typeof SmackHooks.getFuncNamespace('math').add, 'undefined', 'add function removed from the math namespace');
    //   t.equal(typeof SmackHooks.getFuncNamespace('mathematics').add, 'function', 'add function created in the mathematics namespace');
    //   done();
    //  });

    // // delete
    // run(cuc, 'delete').then(() => {
    //   t.equal(store.hasRecordForId('compilation-unit', id), false, 'record still in store');
    //   t.equal(typeof SmackHooks.getFuncNamespace('math').add, 'undefined', 'add function removed from the math namespace');
    //   t.equal(typeof SmackHooks.getFuncNamespace('math').sub, 'undefined', 'sub function removed from the math namespace');
    //   done();
    // });
  });
});

// hooks

// models
define('dummy/tests/integration/serializers/ls-serializer-test', ['exports', 'dummy/tests/helpers/store', 'ember', 'dummy/tests/helpers/fixtures', 'ember-data', 'smack-ember-adapters/adapters/ls-adapter', 'qunit'], function (exports, _dummyTestsHelpersStore, _ember, _dummyTestsHelpersFixtures, _emberData, _smackEmberAdaptersAdaptersLsAdapter, _qunit) {
  var run = _ember['default'].run;

  var env = undefined,
      store = undefined,
      registry = undefined,
      List = undefined,
      Item = undefined;

  (0, _qunit.module)('integration/serializers/ls-serializer - LSSerializer', {
    beforeEach: function beforeEach() {
      localStorage.setItem('DS.LSAdapter', JSON.stringify(_dummyTestsHelpersFixtures['default']));

      List = _emberData['default'].Model.extend({
        name: _emberData['default'].attr('string'),
        done: _emberData['default'].attr('boolean'),
        items: _emberData['default'].hasMany('item', { async: true })
      });

      Item = _emberData['default'].Model.extend({
        name: _emberData['default'].attr('string'),
        list: _emberData['default'].belongsTo('list', { async: true })
      });

      env = (0, _dummyTestsHelpersStore['default'])({
        list: List,
        item: Item,
        adapter: _smackEmberAdaptersAdaptersLsAdapter['default']
      });
      store = env.store;
      registry = env.registry;
    },

    afterEach: function afterEach() {
      run(store, 'destroy');
    }
  });

  (0, _qunit.test)('serializeHasMany respects keyForRelationship', function (assert) {
    assert.expect(1);
    var done = assert.async();
    store.serializerFor('list').reopen({
      keyForRelationship: function keyForRelationship(key /*type*/) {
        return key.toUpperCase();
      }
    });

    var list = run(store, 'createRecord', 'list', { name: 'Rails is omakase', id: 1 });
    var comment = run(store, 'createRecord', 'item', { name: 'Omakase is delicious', list: list, id: 1 });

    return _ember['default'].RSVP.all([list, comment]).then(function () {
      var json = {};
      var snapshot = list._createSnapshot();
      store.serializerFor('list').serializeHasMany(snapshot, json, {
        key: 'items', options: {}
      });
      assert.deepEqual(json, { ITEMS: ['1'] });

      registry.unregister('serializer:list');
      done();
    });
  });

  (0, _qunit.test)('normalizeArrayResponse calls normalizeSingleResponse', function (assert) {
    assert.expect(1);
    var done = assert.async();
    var callCount = 0;

    store.serializerFor('list').reopen({
      normalizeSingleResponse: function normalizeSingleResponse(store, type, payload) {
        callCount++;
        return this.normalize(type, payload);
      }
    });

    run(store, 'findAll', 'list').then(function () {
      assert.equal(callCount, 3);
      done();
    });

    registry.unregister('serializer:list');
  });
});
define('dummy/tests/test-helper', ['exports', 'dummy/tests/helpers/resolver', 'ember-qunit'], function (exports, _dummyTestsHelpersResolver, _emberQunit) {

  (0, _emberQunit.setResolver)(_dummyTestsHelpersResolver['default']);
});
define('dummy/tests/unit/models/compilation-unit-test', ['exports', 'ember-qunit', 'ember', 'smack-ember-adapters/adapters/smackHooks'], function (exports, _emberQunit, _ember, _smackEmberAdaptersAdaptersSmackHooks) {
  var run = _ember['default'].run;
  var get = _ember['default'].get;
  var set = _ember['default'].set;

  (0, _emberQunit.moduleForModel)('compilation-unit', 'Unit | Model | compilation unit', {
    // Specify the other units that are required for this test.
    needs: ['model:test-datum']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

  (0, _emberQunit.test)('beforeCreate - hook', function (t) {
    var model = { name: 'sum', source: 'pack math; func add(a, b) { ret a + b; } func sub(a, b) { ret a - b; }' };

    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, { modelName: 'compilation-unit' }, model);

    t.equal(model.name, 'sum', 'name unchanged');
    t.equal(model.source, 'pack math; func add(a, b) { ret a + b; } func sub(a, b) { ret a - b; }', 'source unchanged');
    t.equal(model.pack, 'math', 'package name set');
    t.deepEqual(model.funcNames, ['add', 'sub'], 'function names set');
    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'function', 'add function created in the math namespace');
    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub, 'function', 'sub function created in the math namespace');

    delete _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add;
    delete _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub;
  });

  (0, _emberQunit.test)('beforeDelete - hook', function (t) {
    var model = { name: 'sum', source: 'pack math; func add(a, b) { ret a + b; } func sub(a, b) { ret a - b; }' };

    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, { modelName: 'compilation-unit' }, model);
    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'function', 'add function created in the math namespace');
    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub, 'function', 'sub function created in the math namespace');

    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeDelete', null, { modelName: 'compilation-unit' }, model);
    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'undefined', 'add function removed from the math namespace');
    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub, 'undefined', 'sub function removed from the math namespace');
  });

  (0, _emberQunit.test)('beforeUpdate - hook', function (t) {
    var model = { name: 'sum', source: 'pack math; func add(a, b) { ret a + b; } func sub(a, b) { ret a - b; }' };

    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, { modelName: 'compilation-unit' }, model);
    model.source = 'pack math; func add(a, b) { ret a + b; }';
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeUpdate', null, { modelName: 'compilation-unit' }, model);

    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'function', 'add function still in the math namespace');
    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub, 'undefined', 'sub function removed from the math namespace');

    model.source = 'pack mathematics; func add(a, b) { ret a + b; }';
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeUpdate', null, { modelName: 'compilation-unit' }, model);

    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'undefined', 'add function removed from the math namespace');
    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('mathematics').add, 'function', 'add function created in the mathematics namespace');

    delete _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('mathematics').add;
  });
});
define('dummy/tests/unit/models/connection-test', ['exports', 'ember', 'ember-qunit', 'smack-ember-adapters/adapters/smackHooks'], function (exports, _ember, _emberQunit, _smackEmberAdaptersAdaptersSmackHooks) {
  var run = _ember['default'].run;
  var get = _ember['default'].get;
  var set = _ember['default'].set;

  (0, _emberQunit.moduleForModel)('connection', 'Unit | Model | connection', {
    // Specify the other units that are required for this test.
    needs: []
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

  (0, _emberQunit.test)('onFind - hook', function (t) {
    var model = { username: 'dude', password: 'IL0veMum', session: 'session 123' };
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'onFind', null, { modelName: 'connection' }, model);
    t.equal(model.username, 'dude', 'username unchanged');
    t.notOk(model.password, 'password hidden');
    t.equal(model.session, 'session 123', 'session unchanged');
  });

  (0, _emberQunit.test)('beforeCreate - hook', function (t) {
    var model = { username: 'dude', password: 'IL0veMum' };
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, { modelName: 'connection' }, model);
    t.equal(model.username, 'dude', 'username unchanged');
    t.equal(model.password, 'IL0veMum', 'password unchanged');
    t.ok(!!model.session, 'session id created');
  });
});
define('dummy/tests/unit/models/execute-anonymous-event-test', ['exports', 'ember', 'ember-qunit', 'smack-ember-adapters/adapters/smackHooks'], function (exports, _ember, _emberQunit, _smackEmberAdaptersAdaptersSmackHooks) {
  var run = _ember['default'].run;
  var get = _ember['default'].get;
  var set = _ember['default'].set;

  (0, _emberQunit.moduleForModel)('execute-anonymous-event', 'Unit | Model | execute anonymous event', {
    // Specify the other units that are required for this test.
    needs: []
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

  (0, _emberQunit.test)('beforeCreate - hook - execute 1 + 1', function (t) {
    var model = { source: 'c = a + b;', arguments: { a: 1, b: 1, c: 0 } };
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, { modelName: 'execute-anonymous-event' }, model);
    t.deepEqual(model.result, { a: 1, b: 1, c: 2 }, 'execution result');
    t.ok(model.success, 'success status');
  });

  (0, _emberQunit.test)('beforeCreate - hook - error', function (t) {
    var model = { source: 'nonexistent["property"] = 1;', arguments: {} };
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, { modelName: 'execute-anonymous-event' }, model);
    t.notOk(model.success, 'success status');
    t.ok(model.errorMessage, 'error message');
  });
});
define('dummy/tests/unit/models/execute-event-test', ['exports', 'ember', 'ember-qunit', 'smack-ember-adapters/adapters/smackHooks'], function (exports, _ember, _emberQunit, _smackEmberAdaptersAdaptersSmackHooks) {
  var run = _ember['default'].run;
  var get = _ember['default'].get;
  var set = _ember['default'].set;

  (0, _emberQunit.moduleForModel)('execute-event', 'Unit | Model | execute event', {
    // Specify the other units that are required for this test.
    needs: []
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });

  (0, _emberQunit.test)('beforeCreate - hook - execute 1 + 1', function (t) {
    _smackEmberAdaptersAdaptersSmackHooks['default'].getPackNamespace('')['math'] = { _f: {
        add: function add(a, b) {
          return a + b;
        }
      } };
    var model = { name: 'math.add', arguments: [1, 1] };
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, { modelName: 'execute-event' }, model);
    t.equal(model.result, 2, 'execution result');
    t.ok(model.success, 'success status');
    console.log(model.errorMessage);
    delete _smackEmberAdaptersAdaptersSmackHooks['default'].getPackNamespace('')['math'];
  });

  (0, _emberQunit.test)('beforeCreate - hook - error', function (t) {
    _smackEmberAdaptersAdaptersSmackHooks['default'].getPackNamespace('')['math'] = { _f: {
        error: function error() {
          throw 'deliberate error';
        }
      } };
    var model = { name: 'math.error' };
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, { modelName: 'execute-event' }, model);
    t.notOk(model.success, 'success status');
    t.equal(model.errorMessage, 'deliberate error', 'error message');
    delete _smackEmberAdaptersAdaptersSmackHooks['default'].getPackNamespace('')['math'];
  });
});
define('dummy/tests/unit/models/test-datum-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForModel)('test-datum', 'Unit | Model | test datum', {
    // Specify the other units that are required for this test.
    needs: ['model:compilation-unit']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });
});
/* jshint ignore:start */

require('dummy/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;

/* jshint ignore:end */
//# sourceMappingURL=tests.map