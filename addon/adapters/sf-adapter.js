import Ember from 'ember';
import DS from 'ember-data';
import SFModels from 'npm:salesforce-ember-models';
SFModels.Ember = Ember;
SFModels.DS = DS;  

var SFAdapter = DS.RESTAdapter.extend({
  sforce: window.sforce ? window.sforce : undefined,
  find : function(store, type, id, snapshot) {
    return this.findRecord(store, type, id, snapshot);
  },
  findRecord : function(store, type, id) {
    return this.query(store, type, "Id = '" + id + "'");
  },
  createRecord: function(store, type, snapshot) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      try {
        var obj = SFModels.sfFormatSnapshot(snapshot, type);
        SFAdapter.sforce.connection.create([obj], 
        function(res) {
          var obj = snapshot.attributes();
          obj.id = res[0].id;
          var pl = {};
          // snapshot.type = Ember.String.dasherize(type.modelName);
          // snapshot.modelName = snapshot.type;
          // pl[snapshot.type] = snapshot;
          pl[type.modelName] = obj;
          Ember.run(null, resolve, pl);
          
          // Update record in the background - in case it has values that are calculated on the server
          SFModels.query(store, type, "Id = '" + res[0].id + "'", 
            function(res) {
              var r = SFModels.formatPayload(type, res);
              store.pushPayload(type.modelName, r);
            }, 
            function(err) { 
              console.log(err); 
          });
        },
        function(err) { 
          console.log(err); 
          Ember.run(null, reject, err);
        });               
      }catch(e) {
        console.log(e.faultstring);
        console.log(e.message);
        console.log(e);
        Ember.run(null, reject, e);
      }
    });
  },
  updateRecord: function(store, type, snapshot) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      try {
        var obj = SFModels.sfFormatSnapshot(snapshot, type);
        SFAdapter.sforce.connection.update([obj], 
        function(res) {
          SFModels.formatRecord(obj);
          var pl = {};
          pl[type.modelName] = obj;
          Ember.run(null, resolve, pl);

          // Update record in the background - in case it has values that are calculated on the server
          SFModels.query(store, type, "Id = '" + res[0].id + "'", 
            function(res) {
              var r = SFModels.formatPayload(type, res);
              store.pushPayload(type.modelName, r);
            }, 
            function(err) { 
              console.log(err); 
            });
        },
        function(err) { 
          console.log(err); 
          Ember.run(null, reject, err);
        });
      }catch(e) {
        console.log(e.faultstring);
        console.log(e.message);
        console.log(e);
        Ember.run(null, reject, e);
      }
    });
  },
  deleteRecord: function(store, type, snapshot) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      try {
        SFAdapter.sforce.connection.deleteIds([snapshot.id], 
        function() {
          Ember.run(null, resolve, {});
        },
        function(err) { 
          console.log(err); 
          Ember.run(null, reject, err);
        });
      }catch(e) {
        console.log(e.faultstring);
        console.log(e.message);
        console.log(e);
        Ember.run(null, reject, e);
      }
    });
  },
  findAll: function(store, type) {
      return this.query(store, type);
  },
  findMany : function(store, type, ids) {
    return this.query(store, type, "Id in " + SFModels.toSoqlArray(ids));
  },
  findQuery : function(store, type, query) {
    return this.query(store, type, query);
  },
  query : function(store, type, query) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      try {
        SFModels.query(store, type, query, 
          function(res) {
            var r = SFModels.formatPayload(type, res);
            Ember.run(null, resolve, r); 
          }, 
          function(err) { 
            console.log(err); 
            Ember.run(null, reject, err);
          });
      } catch(e) {
        console.log(e.faultstring);
        console.log(e.message);
        console.log(e);
        Ember.run(null, reject, e);
      }
    });
  },
  // For ember 2.0 compatibility
  shouldReloadAll : function(store, snapshot) { return store.peekAll( snapshot.type.modelName ).get("length") <= 0; },
  shouldBackgroundReloadRecord : function() { return true; },
});

export default SFAdapter;