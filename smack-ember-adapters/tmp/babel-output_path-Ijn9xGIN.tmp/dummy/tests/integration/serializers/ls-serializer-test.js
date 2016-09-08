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