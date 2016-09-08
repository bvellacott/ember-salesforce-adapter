define('dummy/tests/integration/adapters/smack-models-test', ['exports', 'dummy/tests/helpers/store', 'ember', 'dummy/tests/helpers/smack-model-fixtures', 'ember-data', 'smack-ember-adapters/adapters/ls-adapter', 'smack-ember-adapters/adapters/smackHooks', 'smack-ember-adapters/models/connection', 'smack-ember-adapters/models/compilatoin-unit', 'smack-ember-adapters/models/execute-event', 'smack-ember-adapters/models/execute-anonymous-event', 'qunit'], function (exports, _dummyTestsHelpersStore, _ember, _dummyTestsHelpersSmackModelFixtures, _emberData, _smackEmberAdaptersAdaptersLsAdapter, _smackEmberAdaptersAdaptersSmackHooks, _smackEmberAdaptersModelsConnection, _smackEmberAdaptersModelsCompilatoinUnit, _smackEmberAdaptersModelsExecuteEvent, _smackEmberAdaptersModelsExecuteAnonymousEvent, _qunit) {
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
      localStorage.setItem('DS.LSAdapter', JSON.stringify(_dummyTestsHelpersSmackModelFixtures['default']));

      env = (0, _dummyTestsHelpersStore['default'])({
        'connection': _smackEmberAdaptersModelsConnection['default'],
        'compilation-unit': _smackEmberAdaptersModelsCompilatoinUnit['default'],
        'execute-event': _smackEmberAdaptersModelsExecuteEvent['default'],
        'execute-anonymous-event': _smackEmberAdaptersModelsExecuteAnonymousEvent['default']
      });
      store = env.store;
    },

    afterEach: function afterEach() {
      run(store, 'destroy');
      _smackEmberAdaptersAdaptersSmackHooks['default']._ns = {};
    }
  });

  (0, _qunit.test)('beforeCreate - hook', function (t) {
    var connection = run(store, 'createRecord', 'connection', { username: 'dude', password: 'IL0veMum' });

    var model = this.subject({ username: 'dude', password: 'IL0veMum' });
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, 'connection', model);
    t.equal(model.get('username'), 'dude', 'username unchanged');
    t.equal(model.get('password'), 'IL0veMum', 'password unchanged');
    t.ok(!!model.get('session'), 'session id created');
  });

  (0, _qunit.test)('onFind - hook', function (t) {
    var model = this.subject({ username: 'dude', password: 'IL0veMum', session: 'session 123' });
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'onFind', null, 'connection', model);
    t.equal(model.get('username'), 'dude', 'username unchanged');
    t.notOk(model.get('password'), 'password hidden');
    t.equal(model.get('session'), 'session 123', 'session unchanged');
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

// hoooks

// models