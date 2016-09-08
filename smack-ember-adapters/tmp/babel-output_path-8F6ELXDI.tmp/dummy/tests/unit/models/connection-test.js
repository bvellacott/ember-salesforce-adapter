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
    _smackEmberAdaptersAdaptersSmackHooks['default'].setNamespace({});
    var model = { username: 'dude', password: 'IL0veMum', session: 'session 123' };
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'onFind', null, { modelName: 'connection' }, model);
    t.equal(model.username, 'dude', 'username unchanged');
    t.notOk(model.password, 'password hidden');
    t.equal(model.session, 'session 123', 'session unchanged');
    _smackEmberAdaptersAdaptersSmackHooks['default'].setNamespace({});
  });

  (0, _emberQunit.test)('beforeCreate - hook', function (t) {
    _smackEmberAdaptersAdaptersSmackHooks['default'].setNamespace({});
    var model = { username: 'dude', password: 'IL0veMum' };
    run(_smackEmberAdaptersAdaptersSmackHooks['default'], 'beforeCreate', null, { modelName: 'connection' }, model);
    t.equal(model.username, 'dude', 'username unchanged');
    t.equal(model.password, 'IL0veMum', 'password unchanged');
    t.ok(!!model.session, 'session id created');
    _smackEmberAdaptersAdaptersSmackHooks['default'].setNamespace({});
  });
});