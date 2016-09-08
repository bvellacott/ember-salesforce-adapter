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