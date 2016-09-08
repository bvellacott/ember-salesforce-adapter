define('dummy/tests/integration/adapters/smack-models-test', ['exports', 'dummy/tests/helpers/store', 'ember', 'dummy/tests/helpers/smack-model-fixtures', 'ember-data', 'smack-ember-adapters/adapters/ls-adapter', 'smack-ember-adapters/adapters/smackHooks', 'smack-ember-adapters/models/connection', 'smack-ember-adapters/models/compilation-unit', 'smack-ember-adapters/models/execute-event', 'smack-ember-adapters/models/execute-anonymous-event', 'smack-ember-adapters/models/test-datum', 'qunit'], function (exports, _dummyTestsHelpersStore, _ember, _dummyTestsHelpersSmackModelFixtures, _emberData, _smackEmberAdaptersAdaptersLsAdapter, _smackEmberAdaptersAdaptersSmackHooks, _smackEmberAdaptersModelsConnection, _smackEmberAdaptersModelsCompilationUnit, _smackEmberAdaptersModelsExecuteEvent, _smackEmberAdaptersModelsExecuteAnonymousEvent, _smackEmberAdaptersModelsTestDatum, _qunit) {
  var run = _ember['default'].run;
  var get = _ember['default'].get;
  var set = _ember['default'].set;

  var env = undefined,
      store = undefined;

  (0, _qunit.module)('smack model hooks - LSAdapter', {
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
    t.expect(6);
    // const list = run(store, 'createRecord', 'list', {name: 'Rambo'});
    var connection = run(store, 'createRecord', 'connection', { username: 'dude', password: 'IL0veMum' });
    t.equal(get(connection, 'username'), 'dude', 'username unchanged');
    t.equal(get(connection, 'password'), 'IL0veMum', 'password unchanged');
    // t.ok(!!get(connection, 'session'), 'session id created');

    var done = t.async();
    run(connection, 'save').then(function () {
      store.query('connection', 'where username = "dude"').then(function (records) {
        var con = records.objectAt(0);
        t.equal(get(con, 'id'), get(connection, 'id'), 'id unchanged');
        t.equal(get(con, 'username'), 'dude', 'username unchanged');
        t.notOk(get(con, 'password'), 'password hidden');
        t.ok(get(con, 'session'), 'session id created');
        done();
      });
    });
  });

  (0, _qunit.test)('compilation-unit create, update and delete', function (t) {
    t.expect(15);
    var done = t.async();

    // create
    var unit = run(store, 'createRecord', 'compilation-unit', { name: 'sum', source: 'pack math; func add(a, b) { ret a + b; } func sub(a, b) { ret a - b; }' });
    run(unit, 'save').then(function () {
      t.equal(get(unit, 'name'), 'sum', 'name unchanged');
      t.equal(get(unit, 'source'), 'pack math; func add(a, b) { ret a + b; } func sub(a, b) { ret a - b; }', 'source unchanged');
      t.equal(get(unit, 'pack'), 'math', 'package name set');
      t.deepEqual(get(unit, 'funcNames'), ['add', 'sub'], 'function names set');
      t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'function', 'add function created in the math namespace');
      t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub, 'function', 'sub function created in the math namespace');

      run(unit, 'set', 'source', 'pack math; func add(a, b) { ret a + b; } func error() { nonexistent.param = 1; }');

      run(unit, 'save').then(function (unit) {
        t.equal(get(unit, 'name'), 'sum', 'name unchanged');
        t.equal(get(unit, 'source'), 'pack math; func add(a, b) { ret a + b; } func error() { nonexistent.param = 1; }', 'source updated');
        t.equal(get(unit, 'pack'), 'math', 'package name unchanged');
        t.deepEqual(get(unit, 'funcNames'), ['add', 'error'], 'function names updated');
        t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'function', 'add function still in the math namespace');
        t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub, 'undefined', 'sub function removed from the math namespace');

        var id = get(unit, 'id');
        unit.deleteRecord();
        run(unit, 'save').then(function () {
          t.notOk(store.hasRecordForId('compilation-unit', id), 'record still in store');
          t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').add, 'undefined', 'add function removed from the math namespace');
          t.equal(typeof _smackEmberAdaptersAdaptersSmackHooks['default'].getFuncNamespace('math').sub, 'undefined', 'sub function removed from the math namespace');
          done();
        });
      });
    });
  });

  (0, _qunit.test)('execute', function (t) {
    t.expect(4);
    var done = t.async(2);

    _smackEmberAdaptersAdaptersSmackHooks['default'].getPackNamespace('')['math'] = { _f: {
        add: function add(a, b) {
          return a + b;
        },
        error: function error() {
          throw 'deliberate error';
        }
      } };

    var addExec = run(store, 'createRecord', 'execute-event', { name: 'math.add', arguments: [1, 1] });
    run(addExec, 'save').then(function () {
      t.equal(get(addExec, 'result'), 2, 'execution result');
      t.ok(get(addExec, 'success'), 'success status');
      done();
    });

    var errExec = run(store, 'createRecord', 'execute-event', { name: 'math.error' });
    run(errExec, 'save').then(function () {
      t.notOk(get(errExec, 'success'), 'success status');
      t.equal(get(errExec, 'errorMessage'), 'deliberate error', 'error message');
      done();
    });
  });

  (0, _qunit.test)('execute anonymous', function (t) {
    t.expect(4);
    var done = t.async(2);

    _smackEmberAdaptersAdaptersSmackHooks['default'].getPackNamespace('')['math'] = { _f: {
        add: function add(a, b) {
          return a + b;
        },
        error: function error() {
          throw 'deliberate error';
        }
      } };

    var addExec = run(store, 'createRecord', 'execute-anonymous-event', { source: 'c = a + b', arguments: { a: 1, b: 1, c: 0 } });
    run(addExec, 'save').then(function () {
      t.deepEqual(get(addExec, 'result'), { a: 1, b: 1, c: 2 }, 'execution result');
      t.ok(get(addExec, 'success'), 'success status');
      done();
    });

    var errExec = run(store, 'createRecord', 'execute-anonymous-event', { source: 'math.error();' });
    run(errExec, 'save').then(function () {
      t.notOk(get(errExec, 'success'), 'success status');
      t.equal(get(errExec, 'errorMessage'), 'deliberate error', 'error message');
      done();
    });
  });
});

// hooks

// models