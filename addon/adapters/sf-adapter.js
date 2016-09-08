import Ember from 'ember';
import DS from 'ember-data';

SFAdapter = DS.RESTAdapter.extend({
  find : function(store, type, id, snapshot) {
    return this.findRecord(store, type, id, snapshot);
  },
  findRecord : function(store, type, id, snapshot) {
    return this.query(store, type, "Id = '" + id + "'");
  },
  createRecord: function(store, type, snapshot) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      try {
        var obj = Papu.SF.sfFormatSnapshot(snapshot, type);
        var res = sforce.connection.create([obj], 
        function(res) {
          snapshot.id = res[0].id;
          var pl = {};
          pl[type.modelName] = snapshot;
          Ember.run(null, resolve, pl);
          
          // Update record in the background - in case it has values that are calculated on the server
          Papu.SF.query(store, type, "Id = '" + res[0].id + "'", 
            function(res) {
              var r = Papu.SF.formatPayload(type, res);
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
        var obj = Papu.SF.sfFormatSnapshot(snapshot, type);
        var res = sforce.connection.update([obj], 
        function(res) {
          Papu.SF.formatRecord(obj);
          var pl = {};
          pl[type.modelName] = obj;
          Ember.run(null, resolve, pl);

          // Update record in the background - in case it has values that are calculated on the server
          Papu.SF.query(store, type, "Id = '" + res[0].id + "'", 
            function(res) {
              var r = Papu.SF.formatPayload(type, res);
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
        sforce.connection.deleteIds([snapshot.id], 
        function(res) {
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
  findAll: function(store, type, sinceToken) {
      return this.query(store, type);
  },
    findMany : function(store, type, ids, snapshot) {
      return this.query(store, type, "Id in " + Papu.SF.toSoqlArray(ids));
    },
    findQuery : function(store, type, query) {
      return this.query(store, type, query);
    },
    query : function(store, type, query) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      try {
        Papu.SF.query(store, type, query, 
          function(res) {
            var r = Papu.SF.formatPayload(type, res);
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
    shouldBackgroundReloadRecord : function(store, snapshot) { return true; },
});
