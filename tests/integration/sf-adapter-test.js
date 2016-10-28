import setupStore from 'dummy/tests/helpers/store';
import Ember from 'ember';
import SFAdapter from 'ember-salesforce-adapter/adapters/sf-adapter';
import SFModels from 'npm:salesforce-ember-models';
import mocks from 'npm:sforce-mocks';
var houseSchema = mocks.houseSchema;
var Snapshot = mocks.Snapshot;
var sforce = mocks.sforce;
var Store = mocks.Store;
SFAdapter.sforce = sforce;
SFModels.sforce = sforce;

import {module, test} from 'qunit';

const {run, get, set} = Ember;

let env, store, List, Item, Order, Hour, Person;

var connection = {
  describeGlobal() {
    return { getArray(){ return [
      { name : 'windowObj__c' }, 
      { name : 'doorObj__c' }, 
      { name : 'houseObj__c'} ]; }};
  },
  describeSObjects(objNames, success) { 
    var result = [];
    for(var i = 0; i < objNames.length; i++) {
      var def = houseSchema.sfSchema[objNames[i]];
      if(!def)
      { throw 'object definition by the name: ' + objNames[i] + ' doesn\'t exist'; }
      result.push(def);
    }
    success(result);
  }
};

var models;
var mockSchemaReader;

module('integration/adapters/sf-adapter - SFAdapter', {
  beforeEach() {
    mockSchemaReader = new SFModels.SchemaReader(connection, 100, () => { console.log('fetch complete'); });
    sforce.db.clear();
    // sforce.db.useGivenIds = true;
    sforce.db.schema = houseSchema.sfSchema;
    models = {};
    SFModels.createModelsForSObjects(models, mockSchemaReader.completeMetas, mockSchemaReader, houseSchema.typeFilter);

    models.adapter = SFAdapter;
    env = setupStore(models);
    store = env.store;
  },

  afterEach() {
    run(store, 'destroy');
  }
});

// module('integration/adapters/sf-adapter - SFAdapter', {
//   beforeEach() {
//     console.log(sforce);
//     mockSchemaReader = new SFModels.SchemaReader(connection, 100, () => { console.log('fetch complete'); });
//     sforce.db.clear();
//     sforce.db.useGivenIds = true;
//     sforce.db.schema = houseSchema.sfSchema;
//     models = {};
//     SFModels.createModelsForSObjects(models, mockSchemaReader.completeMetas, mockSchemaReader, houseSchema.typeFilter);
//   },

//   afterEach() {
//   }
// });

test('exists through the store', function(assert) {
  const sfAdapter = store.adapterFor('-default');
  assert.ok(sfAdapter, 'SFAdapter exists');
});

test( 'SFAdapter.createRecord', function( t ) {
  t.expect(8);
  const done = t.async();
  var count = 0;
  // Setup
  // var fa = new SFAdapter();
  // var store = new Store();
  
  for(var emberModelName in houseSchema.formattedSnapshots) {
    var dasherized = Ember.String.dasherize(emberModelName);
    // var emberModel = models[emberModelName];
    // emberModel.modelName = emberModelName;
  
    var records = houseSchema.snapshots[emberModelName];
    for(var i = 0; i < records.length; i++) {
      // var mockInstance = $.extend({ _model : emberModel }, modelSSs[i]);
      // var snapshot = new Snapshot(mockInstance);
      // fa.createRecord(store, emberModel, snapshot);
      var expectedRecord = records[i];
      expectedRecord.id = null;
      expectedRecord.readyByDate__c = null;
      expectedRecord.housePartyTime__c = null;
      var record = run(store, 'createRecord', dasherized, expectedRecord);
      run(record, 'save');
      var records = run(store, 'query', dasherized, "Name = '" + expectedRecord.Name + "'").then(records => {
        // assert.equal(get(records, 'length'), 1, 'Only Rambo was found');
        t.deepEqual(records.objectAt(0).serialize(), expectedRecord, "Record saved and unchanged");
        // t.ok(true, 'testing one two');
        count++;
        if(count === 8)
          done();
      });
      // for(var key in payloads[i]) {
      //   for(var field in payloads[i][key][0]) {
      //     if(typeof payloads[i][key][0][field] !== 'object') 
      //     { t.equal(store.payload[key][0][field], payloads[i][key][0][field], 'Object creation failed on the field: ' + field + ' in object list: ' + key); }
      //     else
      //     { t.deepEqual(store.payload[key][0][field], payloads[i][key][0][field], 'Object creation failed on the field: ' + field + ' in object list: ' + key); }
      //   }
      // }
    }
  }
});

// test( 'SFAdapter.findRecord', function( t ) {
//   // Setup
//   var fa = new SFAdapter();
//   var store = new Store();
  
//   for(var emberModelName in houseSchema.snapshots) {
//     var emberModel = models[emberModelName];
//     emberModel.modelName = emberModelName;
  
//     var modelSSs = houseSchema.snapshots[emberModelName];
//     var payloads = houseSchema.payloads[emberModelName];
//     for(var i = 0; i < modelSSs.length; i++) {
//       var mockInstance = $.extend({ _model : emberModel }, modelSSs[i]);
//       var snapshot = new Snapshot(mockInstance);
//       run(fa, 'createRecord', store, emberModel, snapshot);
//       run(fa, 'findRecord', store, emberModel, snapshot.id);
//       // fa.createRecord(store, emberModel, snapshot);
//       // fa.findRecord(store, emberModel, snapshot.id);
//       // console.log('!PAYLOADS!');
//       // console.log(payloads);
//       for(var key in payloads[i]) {
//         for(var field in payloads[i][key][0]) {
//           if(typeof payloads[i][key][0][field] !== 'object') {
//             // console.log('store: ' + JSON.stringify)
//             t.equal(store.payload[key][0][field], payloads[i][key][0][field], 'Object creation failed on the field: ' + field + ' in object list: ' + key); 
//           }
//           else
//           { t.deepEqual(store.payload[key][0][field], payloads[i][key][0][field], 'Object creation failed on the field: ' + field + ' in object list: ' + key); }
//         }
//       }
//     }
//   }
// });

// test( 'SFAdapter.updateRecord', function( t ) {
//   // Setup
//   var fa = new SFAdapter();
//   var store = new Store();
  
//   for(var emberModelName in houseSchema.snapshots) {
//     var emberModel = models[emberModelName];
//     emberModel.modelName = emberModelName;
  
//     var modelSSs = houseSchema.snapshots[emberModelName];
//     var payloads = houseSchema.payloads[emberModelName];
//     for(var i = 0; i < modelSSs.length; i++) {
//       var mockInstance = $.extend({ _model : emberModel }, modelSSs[i]);
//       var snapshot = new Snapshot(mockInstance);
//       fa.createRecord(store, emberModel, snapshot);
//       mockInstance = $.extend({ _model : emberModel }, modelSSs[i], { Name : 'updated' });
//       snapshot = new Snapshot(mockInstance);
//       fa.updateRecord(store, emberModel, snapshot);
//       fa.findRecord(store, emberModel, snapshot.id);
//       for(var key in payloads[i])
//       { t.equal(store.payload[key][0]['Name'], 'updated', 'Name field didn\'t get updated'); }
//     }
//   }
// });

// test( 'SFAdapter.deleteRecord', function( t ) {
//   // Setup
//   var fa = new SFAdapter();
//   var store = new Store();
  
//   for(var emberModelName in houseSchema.snapshots) {
//     var emberModel = models[emberModelName];
//     emberModel.modelName = emberModelName;
  
//     var modelSSs = houseSchema.snapshots[emberModelName];
//     // var payloads = houseSchema.payloads[emberModelName];
//     for(var i = 0; i < modelSSs.length; i++) {
//       var mockInstance = $.extend({ _model : emberModel }, modelSSs[i]);
//       var snapshot = new Snapshot(mockInstance);
//       fa.createRecord(store, emberModel, snapshot);
//       fa.deleteRecord(store, emberModel, snapshot);
//       store.payload = null;
//       fa.findRecord(store, emberModel, snapshot.id);
//       t.deepEqual(store.payload, null, 'Delete failed');
//     }
//   }
// });

// test( 'SFAdapter.findAll', function( t ) {
//   // Setup
//   var fa = new SFAdapter();
//   var store = new Store();
  
//   var callFindAll = function(){
//     fa.findAll(store, emberModel).then(function(result){
//       var i;
//       var checkResult = function(){
//         fa.findRecord(store, models[emberModelName], result[key][i]['id']).then(function(singleRes) {
//           t.deepEqual(result[key][i], singleRes[key][0], 'findAll failed');
//         });
//       };
//       for(var key in result) {
//         for(i = 0; i < result[key].length; i++) {
//           run(checkResult);
//         }
//       }
//     });
//   };

//   for(var emberModelName in houseSchema.snapshots) {
//     var emberModel = models[emberModelName];
//     emberModel.modelName = emberModelName;
  
//     var modelSSs = houseSchema.snapshots[emberModelName];
//     // var payloads = houseSchema.payloads[emberModelName];
//     for(var i = 0; i < modelSSs.length; i++) {
//       var mockInstance = $.extend({ _model : emberModel }, modelSSs[i]);
//       var snapshot = new Snapshot(mockInstance);
//       fa.createRecord(store, emberModel, snapshot);
//     }
//     run(callFindAll);
//   }
// });

// test( 'SFAdapter.findMany', function( t ) {
//   // Setup
//   var fa = new SFAdapter();
//   var store = new Store();
  
//   var callFindMany = function(){
//     fa.findMany(store, emberModel, ids).then(function(result){
//       var i;
//       var checkResult = function(){
//         fa.findRecord(store, models[emberModelName], result[key][i]['id']).then(function(singleRes) {
//           t.deepEqual(result[key][i], singleRes[key][0], 'findAll failed');
//         });
//       };
//       for(var key in result) {
//         for(i = 0; i < result[key].length; i++) {
//           run(checkResult);
//         }
//       }
//     });
//   };

//   for(var emberModelName in houseSchema.snapshots) {
//     var emberModel = models[emberModelName];
//     emberModel.modelName = emberModelName;
  
//     var modelSSs = houseSchema.snapshots[emberModelName];
//     // var payloads = houseSchema.payloads[emberModelName];
//     var ids = [];
//     for(var i = 0; i < modelSSs.length; i++) {
//       var mockInstance = $.extend({ _model : emberModel }, modelSSs[i]);
//       var snapshot = new Snapshot(mockInstance);
//       ids.push(snapshot.id);
//       fa.createRecord(store, emberModel, snapshot);
//     }
//     run(callFindMany);
//   }
// });
