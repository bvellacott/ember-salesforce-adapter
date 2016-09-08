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
define('dummy/tests/integration/adapters/ls-adapter-test', ['exports', 'dummy/tests/helpers/store', 'ember', 'dummy/tests/helpers/fixtures', 'ember-data', 'smack-ember-adapters/adapters/ls-adapter', 'qunit'], function (exports, _dummyTestsHelpersStore, _ember, _dummyTestsHelpersFixtures, _emberData, _smackEmberAdaptersAdaptersLsAdapter, _qunit) {
  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var run = _ember['default'].run;
  var get = _ember['default'].get;
  var set = _ember['default'].set;

  var env = undefined,
      store = undefined,
      List = undefined,
      Item = undefined,
      Order = undefined,
      Hour = undefined,
      Person = undefined;

  (0, _qunit.module)('integration/adapters/ls-adapter - LSAdapter', {
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

      Order = _emberData['default'].Model.extend({
        name: _emberData['default'].attr('string'),
        b: _emberData['default'].attr('boolean'),
        hours: _emberData['default'].hasMany('hour', { async: true })
      });

      Hour = _emberData['default'].Model.extend({
        name: _emberData['default'].attr('string'),
        amount: _emberData['default'].attr('number'),
        order: _emberData['default'].belongsTo('order', { async: true })
      });

      Person = _emberData['default'].Model.extend({
        name: _emberData['default'].attr('string'),
        birthdate: _emberData['default'].attr('date')
      });

      env = (0, _dummyTestsHelpersStore['default'])({
        list: List,
        item: Item,
        order: Order,
        hour: Hour,
        person: Person,
        adapter: _smackEmberAdaptersAdaptersLsAdapter['default']
      });
      store = env.store;
    },

    afterEach: function afterEach() {
      run(store, 'destroy');
    }
  });

  (0, _qunit.test)('exists through the store', function (assert) {
    var lsAdapter = store.adapterFor('-default');
    var lsSerializer = store.serializerFor('-default');
    assert.ok(lsAdapter, 'LSAdapter exists');
    assert.ok(lsSerializer, 'LSSerializer exists');
  });

  (0, _qunit.test)('find with id', function (assert) {
    assert.expect(3);
    var done = assert.async();
    run(store, 'findRecord', 'list', 'l1').then(function (list) {
      assert.equal(get(list, 'id'), 'l1', 'id is loaded correctly');
      assert.equal(get(list, 'name'), 'one', 'name is loaded correctly');
      assert.equal(get(list, 'done'), true, 'done is loaded correctly');
      done();
    });
  });

  (0, _qunit.test)('find rejects promise for non-existing record', function (assert) {
    assert.expect(1);
    var done = assert.async();
    // using run like on the other tests makes the test fail.
    run(function () {
      store.findRecord('list', 'unknown')['catch'](function () {
        assert.ok(true);
        done();
      });
    });
  });

  (0, _qunit.test)('query', function (assert) {
    assert.expect(2);
    var done = assert.async(2);

    run(store, 'query', 'list', 'where name in ["one", "two"]' /*{name: /one|two/}*/).then(function (records) {
      assert.equal(get(records, 'length'), 2, 'found results for /one|two/');
      done();
    });
    run(store, 'query', 'list', 'where id = "l1" and name = "one"' /*{name: /.+/, id: /l1/}*/).then(function (records) {
      assert.equal(get(records, 'length'), 1, 'found results for {name: /.+/, id: /l1/}');
      done();
    });
  });

  (0, _qunit.test)('query rejects promise when there are no records', function (assert) {
    var done = assert.async();
    assert.expect(2);
    run(store, 'query', 'list', 'where name = "unknown"' /*{name: /unknown/}*/)['catch'](function () {
      assert.ok(true);
      assert.equal(store.hasRecordForId('list', 'unknown'), false);
      done();
    });
  });

  (0, _qunit.test)('findAll', function (assert) {
    assert.expect(4);
    var done = assert.async();

    run(store, 'findAll', 'list').then(function (records) {
      assert.equal(get(records, 'length'), 3, '3 items were found');

      var _records$toArray = records.toArray();

      var _records$toArray2 = _slicedToArray(_records$toArray, 3);

      var firstRecord = _records$toArray2[0];
      var secondRecord = _records$toArray2[1];
      var thirdRecord = _records$toArray2[2];

      assert.equal(get(firstRecord, 'name'), 'one', 'First item name is one');
      assert.equal(get(secondRecord, 'name'), 'two', 'Second item name is two');
      assert.equal(get(thirdRecord, 'name'), 'three', 'Third item name is three');
      done();
    });
  });

  (0, _qunit.test)('queryMany', function (assert) {
    assert.expect(11);
    var done = assert.async();
    run(store, 'query', 'order', 'where done = true' /*{ done: true }*/).then(function (records) {
      var _records$toArray3 = records.toArray();

      var _records$toArray32 = _slicedToArray(_records$toArray3, 3);

      var firstRecord = _records$toArray32[0];
      var secondRecord = _records$toArray32[1];
      var thirdRecord = _records$toArray32[2];

      assert.equal(get(records, 'length'), 3, '3 orders were found');
      assert.equal(get(firstRecord, 'name'), 'one', 'First\'s order name is one');
      assert.equal(get(secondRecord, 'name'), 'three', 'Second\'s order name is three');
      assert.equal(get(thirdRecord, 'name'), 'four', 'Third\'s order name is four');

      var firstHours = firstRecord.get('hours'),
          secondHours = secondRecord.get('hours'),
          thirdHours = thirdRecord.get('hours');

      assert.equal(get(firstHours, 'length'), 2, 'Order one has two hours');
      assert.equal(get(secondHours, 'length'), 2, 'Order three has two hours');
      assert.equal(get(thirdHours, 'length'), 0, 'Order four has no hours');

      var _firstHours$toArray = firstHours.toArray();

      var _firstHours$toArray2 = _slicedToArray(_firstHours$toArray, 2);

      var hourOne = _firstHours$toArray2[0];
      var hourTwo = _firstHours$toArray2[1];

      var _secondHours$toArray = secondHours.toArray();

      var _secondHours$toArray2 = _slicedToArray(_secondHours$toArray, 2);

      var hourThree = _secondHours$toArray2[0];
      var hourFour = _secondHours$toArray2[1];

      assert.equal(get(hourOne, 'amount'), 4, 'Hour one has amount of 4');
      assert.equal(get(hourTwo, 'amount'), 3, 'Hour two has amount of 3');
      assert.equal(get(hourThree, 'amount'), 2, 'Hour three has amount of 2');
      assert.equal(get(hourFour, 'amount'), 1, 'Hour four has amount of 1');
      done();
    });
  });

  (0, _qunit.test)('createRecord', function (assert) {
    assert.expect(5);
    var done = assert.async(2);
    var list = run(store, 'createRecord', 'list', { name: 'Rambo' });

    run(list, 'save').then(function () {
      store.query('list', 'where name = "Rambo"' /*{name: 'Rambo'}*/).then(function (records) {
        var record = records.objectAt(0);

        assert.equal(get(records, 'length'), 1, 'Only Rambo was found');
        assert.equal(get(record, 'name'), 'Rambo', 'Correct name');
        assert.equal(get(record, 'id'), list.id, 'Correct, original id');
        done();
      });
    });

    run(list, 'save').then(function () {
      store.findRecord('list', list.id).then(function (record) {
        assert.equal(get(record, 'name'), 'Rambo', 'Correct name');
        assert.equal(get(record, 'id'), list.id, 'Correct, original id');
        done();
      });
    });
  });

  (0, _qunit.test)('updateRecords', function (assert) {
    assert.expect(3);
    var done = assert.async();
    var list = run(store, 'createRecord', 'list', { name: 'Rambo' });

    run(list, 'save').then(function (list) {
      return store.query('list', 'where name = "Rambo"' /*{name: 'Rambo'}*/).then(function (records) {
        var record = records.objectAt(0);
        record.set('name', 'Macgyver');
        return record.save();
      }).then(function () {
        return store.query('list', 'where name = "Macgyver"' /*{name: 'Macgyver'}*/).then(function (records) {
          var record = records.objectAt(0);
          assert.equal(get(records, 'length'), 1, 'Only one record was found');
          assert.equal(get(record, 'name'), 'Macgyver', 'Updated name shows up');
          assert.equal(get(record, 'id'), list.id, 'Correct, original id');
          done();
        });
      });
    });
  });

  (0, _qunit.test)('deleteRecord', function (assert) {
    assert.expect(2);
    var done = assert.async();

    var assertListIsDeleted = function assertListIsDeleted() {
      return store.query('list', 'where name = "one"' /*{name: 'one'}*/)['catch'](function () {
        assert.ok(true, 'List was deleted');
        done();
      });
    };

    run(function () {
      store.query('list', 'where name = "one"' /*{name: 'one'}*/).then(function (lists) {
        var list = lists.objectAt(0);
        assert.equal(get(list, 'id'), 'l1', 'Item exists');
        list.deleteRecord();
        list.on('didDelete', assertListIsDeleted);
        list.save();
      });
    });
  });

  (0, _qunit.test)('changes in bulk', function (assert) {
    assert.expect(3);
    var done = assert.async();
    var promises = undefined;

    var listToUpdate = run(store, 'findRecord', 'list', 'l1'),
        listToDelete = run(store, 'findRecord', 'list', 'l2'),
        listToCreate = run(store, 'createRecord', 'list', { name: 'Rambo' });

    var updateList = function updateList(list) {
      set(list, 'name', 'updatedName');
      return list;
    };

    var deleteList = function deleteList(list) {
      run(list, 'deleteRecord');
      return list;
    };

    promises = [listToCreate, listToUpdate.then(updateList), listToDelete.then(deleteList)];

    _ember['default'].RSVP.all(promises).then(function (lists) {
      return lists.map(function (list) {
        return list.save();
      });
    }).then(function () {

      var createdList = store.query('list', 'where name = "Rambo"' /*{name: 'Rambo'}*/).then(function (lists) {
        return assert.equal(get(lists, 'length'), 1, 'Record was created successfully');
      });
      var deletedList = store.findRecord('list', 'l2').then(function (list) {
        return assert.equal(get(list, 'length'), undefined, 'Record was deleted successfully');
      });
      var updatedList = store.findRecord('list', 'l1').then(function (list) {
        return assert.equal(get(list, 'name'), 'updatedName', 'Record was updated successfully');
      });

      return _ember['default'].RSVP.all([createdList, deletedList, updatedList]).then(done);
    });
  });

  (0, _qunit.test)('load hasMany association', function (assert) {
    assert.expect(4);
    var done = assert.async();

    run(store, 'findRecord', 'list', 'l1').then(function (list) {
      var items = get(list, 'items');

      var firstItem = get(items, 'firstObject'),
          lastItem = get(items, 'lastObject');

      assert.equal(get(firstItem, 'id'), 'i1', 'first item id is loaded correctly');
      assert.equal(get(firstItem, 'name'), 'one', 'first item name is loaded correctly');
      assert.equal(get(lastItem, 'id'), 'i2', 'last item id is loaded correctly');
      assert.equal(get(lastItem, 'name'), 'two', 'last item name is loaded correctly');
      done();
    });
  });

  (0, _qunit.test)('load belongsTo association', function (assert) {
    assert.expect(2);
    var done = assert.async();

    run(store, 'findRecord', 'item', 'i1').then(function (item) {
      return get(item, 'list');
    }).then(function (list) {
      assert.equal(get(list, 'id'), 'l1', 'id is loaded correctly');
      assert.equal(get(list, 'name'), 'one', 'name is loaded correctly');
      done();
    });
  });

  (0, _qunit.test)('saves belongsTo', function (assert) {
    assert.expect(2);
    var item = undefined,
        listId = 'l2';
    var done = assert.async();

    run(store, 'findRecord', 'list', listId).then(function (list) {
      item = store.createRecord('item', { name: 'three thousand' });
      set(item, 'list', list);

      return _ember['default'].RSVP.all([list.save(), item.save()]);
    }).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var list = _ref2[0];
      var item = _ref2[1];

      store.unloadAll('item');
      return store.findRecord('item', get(item, 'id'));
    }).then(function (item) {
      var list = get(item, 'list');
      assert.ok(get(item, 'list'), 'list is present');
      assert.equal(get(list, 'id'), listId, 'list is retrieved correctly');
      done();
    });
  });

  (0, _qunit.test)('saves hasMany', function (assert) {
    assert.expect(1);
    var listId = 'l2';
    var done = assert.async();

    var list = run(store, 'findRecord', 'list', listId);
    var item = run(store, 'createRecord', 'item', { name: 'three thousand' });

    return _ember['default'].RSVP.all([list, item]).then(function (_ref3) {
      var _ref32 = _slicedToArray(_ref3, 2);

      var list = _ref32[0];
      var item = _ref32[1];

      get(list, 'items').pushObject(item);
      return _ember['default'].RSVP.all([list.save(), item.save()]);
    }).then(function () {
      store.unloadAll('list');
      return store.findRecord('list', listId);
    }).then(function (list) {
      var item = get(list, 'items').objectAt(0);
      assert.equal(get(item, 'name'), 'three thousand', 'item is saved');
      done();
    });
  });

  (0, _qunit.test)('date is loaded correctly', function (assert) {
    assert.expect(2);
    var done = assert.async();

    var date = new Date(1982, 05, 18);
    var person = run(store, 'createRecord', 'person', {
      name: 'Dan', birthdate: date
    });

    return run(person, 'save').then(function () {
      return store.query('person', 'where name = "Dan"' /*{name: 'Dan'}*/).then(function (records) {
        var loadedPerson = get(records, 'firstObject');
        var birthdate = get(loadedPerson, 'birthdate');
        assert.ok(birthdate instanceof Date, 'Date should be loaded as an instance of Date');
        assert.equal(birthdate.getTime(), date.getTime(), 'Date content should be loaded correctly');
        done();
      });
    });
  });

  (0, _qunit.test)('handles localStorage being unavailable', function (assert) {
    assert.expect(3);
    var done = assert.async();

    var calledGetnativeStorage = false;
    var handler = function handler() {
      calledGetnativeStorage = true;
    };
    var adapter = store.get('defaultAdapter');

    // We can't actually disable localStorage in PhantomJS, so emulate as closely as possible by
    // causing a wrapper method on the adapter to throw.
    adapter.getNativeStorage = function () {
      throw new Error('Nope.');
    };
    adapter.on('persistenceUnavailable', handler);

    var person = run(store, 'createRecord', 'person', { id: 'tom', name: 'Tom' });
    assert.notOk(calledGetnativeStorage, 'Should not trigger `persistenceUnavailable` until actually trying to persist');

    run(person, 'save').then(function () {
      assert.ok(calledGetnativeStorage, 'Saving a record without local storage should trigger `persistenceUnavailable`');
      store.unloadRecord(person);
      return store.findRecord('person', 'tom');
    }).then(function (reloadedPerson) {
      assert.equal(get(reloadedPerson, 'name'), 'Tom', 'Records should still persist in-memory without local storage');
      done();
    });
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

  (0, _qunit.test)('connection create and find - hook', function (t) {
    t.expect(7);
    // const list = run(store, 'createRecord', 'list', {name: 'Rambo'});
    var connection = run(store, 'createRecord', 'connection', { username: 'dude', password: 'IL0veMum' });
    t.equal(get(connection, 'username'), 'dude', 'username unchanged');
    t.equal(get(connection, 'password'), 'IL0veMum', 'password unchanged');
    t.ok(!!get(connection, 'session'), 'session id created');

    var done = t.async();
    run(store, 'findRecord', 'connection', get(connection, 'id')).then(function (con) {
      t.equal(get(con, 'id'), get(connection, 'id'), 'id unchanged');
      t.equal(get(con, 'username'), 'dude', 'username unchanged');
      t.notOk(get(con, 'password'), 'password hidden');
      t.equal(get(con, 'session'), get(connection, 'session'), 'session unchanged');
      done();
    });
  });

  (0, _qunit.test)('compilation-unit create, update, execute, execute anonymous and delete - hook', function (t) {
    t.expect(32);

    // create
    var cuc = run(store, 'createRecord', 'compilation-unit', { name: 'sum', source: 'pack math; func add(a, b) { ret a + b; } func sub(a, b) { ret a - b; }' });
    var id = get(cuc, 'id');

    var done = t.async(4);
    run(store, 'findRecord', 'compilation-unit', get(cuc, 'id')).then(function (cuf) {
      t.equal(get(cuf, 'id'), get(cuc, 'id'), 'id unchanged');
      t.equal(get(cuf, 'name'), 'sum', 'name unchanged');
      t.equal(get(cuf, 'source'), 'pack math; func add(a, b) { ret a + b; } func sub(a, b) { ret a - b; }', 'source unchanged');
      t.equal(get(cuf, 'pack'), 'math', 'package name set');
      t.deepEqual(get(cuf, 'funcNames'), ['add', 'sub'], 'function names set');
      t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'function', 'add function created in the math namespace');
      t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub, 'function', 'sub function created in the math namespace');

      cuc = cuf;
      done();
    });

    // update
    run(cuc, 'set', 'source', 'pack math; func add(a, b) { ret a + b; } func error() { nonexistent.param = 1; }');

    run(cuc, 'save').then(function (cuu) {
      t.equal(get(cuu, 'id'), get(cuc, 'id'), 'id unchanged');
      t.equal(get(cuu, 'name'), 'sum', 'name unchanged');
      t.equal(get(cuu, 'source'), 'pack math; func add(a, b) { ret a + b; } func error() { nonexistent.param = 1; }', 'source updated');
      t.equal(get(cuu, 'pack'), 'math', 'package name unchanged');
      t.deepEqual(get(cuu, 'funcNames'), ['add', 'error'], 'function names updated');
      t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'function', 'add function still in the math namespace');
      t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub, 'undefined', 'sub function removed from the math namespace');
      done();
    });

    // execute
    var ee = run(store, 'createRecord', 'execute-event', { name: 'math.add', arguments: [1, 1] });
    t.equal(get(ee, 'result'), 2, 'execution result');
    t.ok(get(ee, 'success'), 'success status');

    ee = run(store, 'createRecord', 'execute-event', { name: 'math.error' });
    t.notOk(get(ee, 'success'), 'success status');
    t.ok(get(ee, 'errorMessage'), 'error message');

    // execute anonymous
    var eae = run(store, 'createRecord', 'execute-anonymous-event', { source: 'c = a + b', arguments: { a: 1, b: 1, c: 0 } });
    t.deepEqual(get(eae, 'result'), { a: 1, b: 1, c: 2 }, 'execution result');
    t.ok(get(eae, 'success'), 'success status');

    eae = run(store, 'createRecord', 'execute-anonymous-event', { source: 'nonexistent.property = 1', arguments: {} });
    t.notOk(get(eae, 'success'), 'success status');
    t.ok(get(eae, 'errorMessage'), 'error message');

    // update again
    run(cuc, 'set', 'source', 'pack mathematics; func add(a, b) { ret a + b; }');

    run(cuc, 'save').then(function (cuu) {
      t.equal(get(cuu, 'id'), get(cuc, 'id'), 'id unchanged');
      t.equal(get(cuu, 'name'), 'sum', 'name unchanged');
      t.equal(get(cuu, 'source'), 'pack mathematics; func add(a, b) { ret a + b; }', 'source updated');
      t.equal(get(cuu, 'pack'), 'mathematics', 'package name updated');
      t.deepEqual(get(cuu, 'funcNames'), ['add'], 'function names unchanged');
      t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'undefined', 'add function removed from the math namespace');
      t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('mathematics').add, 'function', 'add function created in the mathematics namespace');
      done();
    });

    // delete
    run(cuc, 'delete').then(function () {
      t.equal(store.hasRecordForId('compilation-unit', id), false, 'record still in store');
      t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'undefined', 'add function removed from the math namespace');
      t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub, 'undefined', 'sub function removed from the math namespace');
      done();
    });
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
    var model = this.subject({ name: 'sum', source: 'pack math; func add(a, b) { ret a + b; } func sub(a, b) { ret a - b; }' });

    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, 'compilation-unit', model);

    t.equal(model.get('name'), 'sum', 'name unchanged');
    t.equal(model.get('source'), 'pack math; func add(a, b) { ret a + b; } func sub(a, b) { ret a - b; }', 'source unchanged');
    t.equal(model.get('pack'), 'math', 'package name set');
    t.deepEqual(model.get('funcNames'), ['add', 'sub'], 'function names set');
    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'function', 'add function created in the math namespace');
    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub, 'function', 'sub function created in the math namespace');

    delete _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add;
    delete _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub;
  });

  (0, _emberQunit.test)('beforeDelete - hook', function (t) {
    var model = this.subject({ name: 'sum', source: 'pack math; func add(a, b) { ret a + b; } func sub(a, b) { ret a - b; }' });

    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, 'compilation-unit', model);
    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'function', 'add function created in the math namespace');
    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub, 'function', 'sub function created in the math namespace');

    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeDelete', null, 'compilation-unit', model);
    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'undefined', 'add function removed from the math namespace');
    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub, 'undefined', 'sub function removed from the math namespace');
  });

  (0, _emberQunit.test)('beforeUpdate - hook', function (t) {
    var model = this.subject({ name: 'sum', source: 'pack math; func add(a, b) { ret a + b; } func sub(a, b) { ret a - b; }' });

    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, 'compilation-unit', model);
    run(model, 'set', 'source', 'pack math; func add(a, b) { ret a + b; }');
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeUpdate', null, 'compilation-unit', model);

    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'function', 'add function still in the math namespace');
    t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub, 'undefined', 'sub function removed from the math namespace');

    run(model, 'set', 'source', 'pack mathematics; func add(a, b) { ret a + b; }');
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeUpdate', null, 'compilation-unit', model);

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
    var model = this.subject({ username: 'dude', password: 'IL0veMum', session: 'session 123' });
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'onFind', null, 'connection', model);
    t.equal(model.get('username'), 'dude', 'username unchanged');
    t.notOk(model.get('password'), 'password hidden');
    t.equal(model.get('session'), 'session 123', 'session unchanged');
  });

  (0, _emberQunit.test)('beforeCreate - hook', function (t) {
    var model = this.subject({ username: 'dude', password: 'IL0veMum' });
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, 'connection', model);
    t.equal(model.get('username'), 'dude', 'username unchanged');
    t.equal(model.get('password'), 'IL0veMum', 'password unchanged');
    t.ok(!!model.get('session'), 'session id created');
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
    var model = this.subject({ source: 'c = a + b', arguments: { a: 1, b: 1, c: 0 } });
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, 'execute-anonymous-event', model);
    t.deepEqual(model.get('result'), { a: 1, b: 1, c: 2 }, 'execution result');
    t.ok(model.get('success'), 'success status');
  });

  (0, _emberQunit.test)('beforeCreate - hook - error', function (t) {
    var model = this.subject({ source: 'nonexistent.property = 1', arguments: {} });
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, 'execute-anonymous-event', model);
    t.notOk(model.get('success'), 'success status');
    t.ok(model.get('errorMessage'), 'error message');
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
    var model = this.subject({ name: 'math.add', arguments: [1, 1] });
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, 'execute-event', model);
    t.equal(model.get('result'), 2, 'execution result');
    t.ok(model.get('success'), 'success status');
    delete _smackEmberAdaptersAdaptersSmackHooks['default'].getPackNamespace('')['math'];
  });

  (0, _emberQunit.test)('beforeCreate - hook - error', function (t) {
    _smackEmberAdaptersAdaptersSmackHooks['default'].getPackNamespace('')['math'] = { _f: {
        error: function error() {
          throw 'deliberate error';
        }
      } };
    var model = this.subject({ name: 'math.error' });
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, 'execute-event', model);
    t.notOk(model.get('success'), 'success status');
    t.equal(model.get('errorMessage'), 'deliberate error', 'error message');
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