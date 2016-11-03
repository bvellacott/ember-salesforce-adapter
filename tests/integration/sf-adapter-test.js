import setupStore from 'dummy/tests/helpers/store';
import Ember from 'ember';
import SFAdapter from 'ember-salesforce-adapter/adapters/sf-adapter';
import SFModels from 'npm:salesforce-ember-models';
import mocks from 'npm:sforce-mocks';
var houseSchema = mocks.houseSchema;
var sforce = mocks.sforce;
SFAdapter.sforce = sforce;
SFModels.sforce = sforce;

import {module, test} from 'qunit';

const {run} = Ember;

let env, store;

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

test( 'create record and query by name', function( t ) {
  t.expect(1);
  const done = t.async();

  var expectedRecord = {
    Name : 'Our House',
    isBigHouse__c : true,
    housePartyTime__c : "2017-01-01T12:00:00.000Z",
    cost__c : 70000,
    readyByDate__c : "2017-01-01T00:00:00.000Z",
    ownerContact__c : "Kimberly",
    height__c : 7,
    address__c : 'Blackfriars',
    contactPhone__c : '07461231236',
    floorPlan__c : 'large',
    insurances__c : 'only required',
    description__c : 'beautiful',
    alarmPin__c : "1234",
    website__c : 'ourhouse.com',
    floors__c : 3,
  };
  var record = run(store, 'createRecord', 'house-objccc', expectedRecord);

  // set all non-updateable fields to null and false on the expected record as that's how they should return
  // expectedRecord.isBigHouse__c = false;
  // expectedRecord.insurances__c = null;
  // expectedRecord.ownerContact__c = null;

  run(record, 'save').then(() => {
    run(store, 'query', 'house-objccc', "Name = '" + expectedRecord.Name + "'").then(records => {
      var result = records.objectAt(0).serialize();
      t.deepEqual(result, expectedRecord, "Record saved and unchanged");
      done();
    });
  });
});

test( 'create and find record', function( t ) {
  t.expect(1);
  const done = t.async();

  var expectedRecord = {
    // id : null,
    Name : 'Our House',
    isBigHouse__c : true,
    housePartyTime__c : "2017-01-01T12:00:00.000Z",
    cost__c : 70000,
    readyByDate__c : "2017-01-01T00:00:00.000Z",
    ownerContact__c : "Kimberly",
    height__c : 7,
    address__c : 'Blackfriars',
    contactPhone__c : '07461231236',
    floorPlan__c : 'large',
    insurances__c : 'only required',
    description__c : 'beautiful',
    alarmPin__c : "1234",
    website__c : 'ourhouse.com',
    floors__c : 3,
  };
  var record = run(store, 'createRecord', 'house-objccc', expectedRecord);

  // set all non-updateable fields to null and false on the expected record as that's how they should return
  // expectedRecord.isBigHouse__c = false;
  // expectedRecord.insurances__c = null;
  // expectedRecord.ownerContact__c = null;

  run(record, 'save').then((res) => {
    run(store, 'findRecord', 'house-objccc', res.id).then(result => {
      t.deepEqual(result.serialize(), expectedRecord, "Record saved and unchanged");
      done();
    });
  });
});

test( 'create, save, change and save record', function( t ) {
  t.expect(4);
  const done = t.async(2);

  var house = run(store, 'createRecord', 'house-objccc', {
    Name : 'Our House',
    isBigHouse__c : true,
    housePartyTime__c : "2017-01-01T12:00:00.000Z",
    cost__c : 70000,
    readyByDate__c : "2017-01-01T00:00:00.000Z",
    ownerContact__c : "Kimberly",
    height__c : 7,
    address__c : 'Blackfriars',
    contactPhone__c : '07461231236',
    floorPlan__c : 'large',
    insurances__c : 'only required',
    description__c : 'beautiful',
    alarmPin__c : "1234",
    website__c : 'ourhouse.com',
    floors__c : 3,
  });

  run(house, 'save').then((record1) => {
    record1.set('Name', 'Our Small House');
    record1.set('isBigHouse__c', false);
    record1.set('alarmPin__c', '0000');
    record1.set('website__c', 'oursmallhouse.com');
    record1.set('cost__c', 60000);
    run(record1, 'save').then((record2) => {
      run(store, 'findRecord', 'house-objccc', record2.id).then(result => {
        t.deepEqual(result.serialize(), {
            Name : 'Our Small House',
            isBigHouse__c : false,
            housePartyTime__c : "2017-01-01T12:00:00.000Z",
            cost__c : 60000,
            readyByDate__c : "2017-01-01T00:00:00.000Z",
            ownerContact__c : "Kimberly",
            height__c : 7,
            address__c : 'Blackfriars',
            contactPhone__c : '07461231236',
            floorPlan__c : 'large',
            insurances__c : 'only required',
            description__c : 'beautiful',
            alarmPin__c : "0000",
            website__c : 'oursmallhouse.com',
            floors__c : 3,
          }, "House record saved and unchanged");
        done();
      });
    });
  });

  var expectedRecord = {
    Name : 'Front Door',
    knobType__c : 'bronze',
    house__c : house,
  };

  var door = run(store, 'createRecord', 'door-objccc', expectedRecord);

  run(door, 'save').then((record1) => {
    record1.set('Name', 'Back Door');
    record1.set('knobType__c', 'wood');
    run(record1, 'save').then((record2) => {
      run(store, 'findRecord', 'door-objccc', record2.id).then(result => {
        t.equal(result.get('Name'), 'Back Door', 'Name');
        t.equal(result.get('knobType__c'), 'wood', 'knobType__c');
        t.ok(result.get('house__c'), 'house__c');
        done();
      });
    });
  });
});

test( 'SFAdapter.deleteRecord', function( t ) {
  t.expect(1);
  const done = t.async();

  var expectedRecord = {
    Name : 'Front Door',
    knobType__c : 'bronze',
  };

  var door = run(store, 'createRecord', 'door-objccc', expectedRecord);

  run(door, 'save').then(record1 => {
    run(store, 'findRecord', 'door-objccc', record1.id).then(result => {
      result.deleteRecord();
      result.on('didDelete', () => {
        run(store, 'query', 'door-objccc', "Name = 'Front Door'").then(results => {
          t.equal(results.get('length'), 0, 'Door deleted');
          done();
        });
      });
      result.save();
    });
  });
});

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
