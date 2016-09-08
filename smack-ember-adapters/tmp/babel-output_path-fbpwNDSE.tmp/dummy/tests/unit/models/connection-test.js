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