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