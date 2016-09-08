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