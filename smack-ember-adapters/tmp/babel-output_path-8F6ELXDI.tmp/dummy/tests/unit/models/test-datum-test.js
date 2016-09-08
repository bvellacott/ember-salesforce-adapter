define('dummy/tests/unit/models/test-datum-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForModel)('test-datum', 'Unit | Model | test datum', {
    // Specify the other units that are required for this test.
    needs: ['model:compilation-unit'] });

  (0, _emberQunit.test)('it exists', function (assert) {
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });
});