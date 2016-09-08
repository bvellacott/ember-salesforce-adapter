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
    _smackEmberAdaptersAdaptersSmackHooks['default'].setNamespace({});
    var model = { source: 'c = a + b;', arguments: { a: 1, b: 1, c: 0 } };
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, { modelName: 'execute-anonymous-event' }, model);
    t.deepEqual(model.result, { a: 1, b: 1, c: 2 }, 'execution result');
    t.ok(model.success, 'success status');
    _smackEmberAdaptersAdaptersSmackHooks['default'].setNamespace({});
  });

  (0, _emberQunit.test)('beforeCreate - hook - error', function (t) {
    _smackEmberAdaptersAdaptersSmackHooks['default'].setNamespace({});
    var model = { source: 'nonexistent["property"] = 1;', arguments: {} };
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, { modelName: 'execute-anonymous-event' }, model);
    t.notOk(model.success, 'success status');
    t.ok(model.errorMessage, 'error message');
    _smackEmberAdaptersAdaptersSmackHooks['default'].setNamespace({});
  });
});