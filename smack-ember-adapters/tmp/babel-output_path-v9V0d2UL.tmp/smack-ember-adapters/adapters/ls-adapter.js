define('smack-ember-adapters/adapters/ls-adapter', ['exports', 'ember', 'ember-data', 'npm:where-clause-evaluate', 'smack-ember-adapters/adapters/smackHooks'], function (exports, _ember, _emberData, _npmWhereClauseEvaluate, _smackEmberAdaptersAdaptersSmackHooks) {
  // TODO :
  // - add hooks for incoming and outgoing records of specific types.
  // - create package for ember models, complete with pluggable triggers fired off the hooks

  'use strict';

  var DEFAULT_NAMESPACE = 'DS.LSAdapter';

  var LSAdapter = _emberData['default'].Adapter.extend(_ember['default'].Evented, {
    /**
     * This governs if promises will be resolved immeadiatly for `findAll`
     * requests or if they will wait for the store requests to finish. This matches
     * the ember < 2.0 behavior.
     * [deprecation id: ds.adapter.should-reload-all-default-behavior]
     */
    shouldReloadAll: function shouldReloadAll() /* modelClass, snapshotArray */{
      return true;
    },

    /**
     * Conforms to ember <2.0 behavior, in order to remove deprecation.
     * Probably safe to remove if running on ember 2.0
     * [deprecation id: ds.model.relationship-changing-to-asynchrounous-by-default]
     */
    shouldBackgroundReloadRecord: function shouldBackgroundReloadRecord() {
      return false;
    },

    /**
      This is the main entry point into finding records. The first parameter to
      this method is the model's name as a string.
       @method find
      @param {DS.Model} type
      @param {Object|String|Integer|null} id
      */
    findRecord: function findRecord(store, type, id, opts) {
      var allowRecursive = true;
      var namespace = this._namespaceForType(type);
      var record = _ember['default'].A(namespace.records[id]);

      /**
       * In the case where there are relationships, this method is called again
       * for each relation. Given the relations have references to the main
       * object, we use allowRecursive to avoid going further into infinite
       * recursiveness.
       *
       * Concept from ember-indexdb-adapter
       */
      if (opts && typeof opts.allowRecursive !== 'undefined') {
        allowRecursive = opts.allowRecursive;
      }

      if (!record || !record.hasOwnProperty('id')) {
        return _ember['default'].RSVP.reject(new Error("Couldn't find record of" + " type '" + type.modelName + "' for the id '" + id + "'."));
      }

      var res;
      if (allowRecursive) {
        res = this.loadRelationships(store, type, record);
      } else {
        res = _ember['default'].RSVP.resolve(record);
      }
      try {
        _smackEmberAdaptersAdaptersSmackHooks['default'].onFind(store, type, res, allowRecursive);
      } catch (e) {
        return _ember['default'].RSVP.reject(new Error("On find hook failed on: " + " type '" + type.modelName + "' for the id '" + id + "'.\n\n" + e));
      }
      return res;
    },

    findMany: function findMany(store, type, ids, opts) {
      var namespace = this._namespaceForType(type);
      var allowRecursive = true,
          results = _ember['default'].A([]),
          record;

      /**
       * In the case where there are relationships, this method is called again
       * for each relation. Given the relations have references to the main
       * object, we use allowRecursive to avoid going further into infinite
       * recursiveness.
       *
       * Concept from ember-indexdb-adapter
       */
      if (opts && typeof opts.allowRecursive !== 'undefined') {
        allowRecursive = opts.allowRecursive;
      }

      for (var i = 0; i < ids.length; i++) {
        record = namespace.records[ids[i]];
        if (!record || !record.hasOwnProperty('id')) {
          return _ember['default'].RSVP.reject(new Error("Couldn't find record of type '" + type.modelName + "' for the id '" + ids[i] + "'."));
        }
        results.push(_ember['default'].copy(record));
      }

      var res;
      if (results.get('length') && allowRecursive) {
        res = this.loadRelationshipsForMany(store, type, results);
      } else {
        res = _ember['default'].RSVP.resolve(results);
      }
      try {
        _smackEmberAdaptersAdaptersSmackHooks['default'].onFindMany(store, type, res, allowRecursive);
      } catch (e) {
        return _ember['default'].RSVP.reject(new Error("On find hook failed on: " + " type '" + type.modelName + "'.\n\n" + e));
      }
      return res;
    },

    // Supports queries that look like this:
    //
    //   {
    //     <property to query>: <value or regex (for strings) to match>,
    //     ...
    //   }
    //
    // Every property added to the query is an "AND" query, not "OR"
    //
    // Example:
    //
    //  match records with "complete: true" and the name "foo" or "bar"
    //
    //    { complete: true, name: /foo|bar/ }
    query: function query(store, type, _query /*recordArray*/) {
      var namespace = this._namespaceForType(type);
      var results = this._query(namespace.records, _query);

      var allowRecursive = results.get('length');

      var res;
      if (allowRecursive) {
        res = this.loadRelationshipsForMany(store, type, results);
      } else {
        res = _ember['default'].RSVP.reject();
      }
      try {
        _smackEmberAdaptersAdaptersSmackHooks['default'].onQuery(store, type, res, allowRecursive);
      } catch (e) {
        return _ember['default'].RSVP.reject(new Error("On find hook failed on: " + " type '" + type.modelName + "'.\n\n" + e));
      }
      return res;
    },

    _evaluate: _npmWhereClauseEvaluate['default'].newEvaluator({ cache: true }),

    _query: function _query(records, query) {
      var results = _ember['default'].A([]),
          record;

      for (var id in records) {
        record = records[id];
        if (!query || this._evaluate(record, query)) {
          results.push(_ember['default'].copy(record));
        }
      }
      return results;
    },

    findAll: function findAll(store, type) {
      var namespace = this._namespaceForType(type),
          results = _ember['default'].A([]);

      for (var id in namespace.records) {
        results.push(_ember['default'].copy(namespace.records[id]));
      }
      var res = _ember['default'].RSVP.resolve(results);
      try {
        _smackEmberAdaptersAdaptersSmackHooks['default'].onFindAll(store, type, res);
      } catch (e) {
        return _ember['default'].RSVP.reject(new Error("On find hook failed on: " + " type '" + type.modelName + "'.\n\n" + e));
      }
      return res;
    },

    createRecord: function createRecord(store, type, snapshot) {
      var namespaceRecords = this._namespaceForType(type);
      var serializer = store.serializerFor(type.modelName);
      var recordHash = serializer.serialize(snapshot, { includeId: true });

      namespaceRecords.records[recordHash.id] = recordHash;

      try {
        _smackEmberAdaptersAdaptersSmackHooks['default'].beforeCreate(store, type, namespaceRecords);
      } catch (e) {
        return _ember['default'].RSVP.reject(new Error("Before create hook failed on: " + " type '" + type.modelName + "' for the id '" + id + "'.\n\n" + e));
      }
      this.persistData(type, namespaceRecords);
      try {
        _smackEmberAdaptersAdaptersSmackHooks['default'].afterCreate(store, type, namespaceRecords);
      } catch (e) {
        return _ember['default'].RSVP.reject(new Error("After create hook failed on: " + " type '" + type.modelName + "' for the id '" + id + "'.\n\n" + e));
      }
      return _ember['default'].RSVP.resolve();
    },

    updateRecord: function updateRecord(store, type, snapshot) {
      var namespaceRecords = this._namespaceForType(type);
      var id = snapshot.id;
      var serializer = store.serializerFor(type.modelName);

      namespaceRecords.records[id] = serializer.serialize(snapshot, { includeId: true });

      try {
        _smackEmberAdaptersAdaptersSmackHooks['default'].beforeUpdate(store, type, namespaceRecords);
      } catch (e) {
        return _ember['default'].RSVP.reject(new Error("Before update hook failed on: " + " type '" + type.modelName + "' for the id '" + id + "'.\n\n" + e));
      }
      this.persistData(type, namespaceRecords);
      try {
        _smackEmberAdaptersAdaptersSmackHooks['default'].afterUpdate(store, type, namespaceRecords);
      } catch (e) {
        return _ember['default'].RSVP.reject(new Error("After update hook failed on: " + " type '" + type.modelName + "' for the id '" + id + "'.\n\n" + e));
      }
      return _ember['default'].RSVP.resolve();
    },

    deleteRecord: function deleteRecord(store, type, snapshot) {
      var namespaceRecords = this._namespaceForType(type);
      var id = snapshot.id;

      try {
        _smackEmberAdaptersAdaptersSmackHooks['default'].beforeDelete(store, type, namespaceRecords);
      } catch (e) {
        return _ember['default'].RSVP.reject(new Error("Before delete hook failed on: " + " type '" + type.modelName + "' for the id '" + id + "'.\n\n" + e));
      }
      delete namespaceRecords.records[id];
      this.persistData(type, namespaceRecords);
      try {
        _smackEmberAdaptersAdaptersSmackHooks['default'].afterDelete(store, type, namespaceRecords);
      } catch (e) {
        return _ember['default'].RSVP.reject(new Error("After delete hook failed on: " + " type '" + type.modelName + "' for the id '" + id + "'.\n\n" + e));
      }
      return _ember['default'].RSVP.resolve();
    },

    generateIdForRecord: function generateIdForRecord() {
      return Math.random().toString(32).slice(2).substr(0, 5);
    },

    // private

    adapterNamespace: function adapterNamespace() {
      return this.get('namespace') || DEFAULT_NAMESPACE;
    },

    loadData: function loadData() {
      var storage = this.getLocalStorage().getItem(this.adapterNamespace());
      return storage ? JSON.parse(storage) : {};
    },

    persistData: function persistData(type, data) {
      var modelNamespace = this.modelNamespace(type);
      var localStorageData = this.loadData();

      localStorageData[modelNamespace] = data;

      this.getLocalStorage().setItem(this.adapterNamespace(), JSON.stringify(localStorageData));
    },

    getLocalStorage: function getLocalStorage() {
      if (this._localStorage) {
        return this._localStorage;
      }

      var storage;
      try {
        storage = this.getNativeStorage() || this._enableInMemoryStorage();
      } catch (e) {
        storage = this._enableInMemoryStorage(e);
      }
      this._localStorage = storage;
      return this._localStorage;
    },

    _enableInMemoryStorage: function _enableInMemoryStorage(reason) {
      this.trigger('persistenceUnavailable', reason);
      return {
        storage: {},
        getItem: function getItem(name) {
          return this.storage[name];
        },
        setItem: function setItem(name, value) {
          this.storage[name] = value;
        }
      };
    },

    // This exists primarily as a testing extension point
    getNativeStorage: function getNativeStorage() {
      return localStorage;
    },

    _namespaceForType: function _namespaceForType(type) {
      var namespace = this.modelNamespace(type);
      var storage = this.loadData();

      return storage[namespace] || { records: {} };
    },

    modelNamespace: function modelNamespace(type) {
      return type.url || type.modelName;
    },

    /**
     * This takes a record, then analyzes the model relationships and replaces
     * ids with the actual values.
     *
     * Stolen from ember-indexdb-adapter
     *
     * Consider the following JSON is entered:
     *
     * ```js
     * {
     *   "id": 1,
     *   "title": "Rails Rambo",
     *   "comments": [1, 2]
     * }
     *
     * This will return:
     *
     * ```js
     * {
     *   "id": 1,
     *   "title": "Rails Rambo",
     *   "comments": [1, 2]
     *
     *   "_embedded": {
     *     "comment": [{
     *       "_id": 1,
     *       "comment_title": "FIRST"
     *     }, {
     *       "_id": 2,
     *       "comment_title": "Rails is unagi"
     *     }]
     *   }
     * }
     *
     * This way, whenever a resource returned, its relationships will be also
     * returned.
     *
     * @method loadRelationships
     * @private
     * @param {DS.Model} type
     * @param {Object} record
     */
    loadRelationships: function loadRelationships(store, type, record) {
      var adapter = this,
          relationshipNames,
          relationships;

      /**
       * Create a chain of promises, so the relationships are
       * loaded sequentially.  Think of the variable
       * `recordPromise` as of the accumulator in a left fold.
       */
      var recordPromise = _ember['default'].RSVP.resolve(record);

      relationshipNames = _ember['default'].get(type, 'relationshipNames');
      relationships = relationshipNames.belongsTo.concat(relationshipNames.hasMany);

      relationships.forEach(function (relationName) {
        var relationModel = type.typeForRelationship(relationName, store);
        var relationEmbeddedId = record[relationName];
        var relationProp = adapter.relationshipProperties(type, relationName);
        var relationType = relationProp.kind;

        var opts = { allowRecursive: false };

        /**
         * embeddedIds are ids of relations that are included in the main
         * payload, such as:
         *
         * {
         *    cart: {
         *      id: "s85fb",
         *      customer: "rld9u"
         *    }
         * }
         *
         * In this case, cart belongsTo customer and its id is present in the
         * main payload. We find each of these records and add them to _embedded.
         */
        if (relationEmbeddedId && LSAdapter.prototype.isPrototypeOf(adapter)) {
          recordPromise = recordPromise.then(function (recordPayload) {
            var promise;
            if (relationType === 'belongsTo' || relationType === 'hasOne') {
              promise = adapter.findRecord(null, relationModel, relationEmbeddedId, opts);
            } else if (relationType === 'hasMany') {
              promise = adapter.findMany(null, relationModel, relationEmbeddedId, opts);
            }

            return promise.then(function (relationRecord) {
              return adapter.addEmbeddedPayload(recordPayload, relationName, relationRecord);
            });
          });
        }
      });

      return recordPromise;
    },

    /**
     * Given the following payload,
     *
     *   {
     *      cart: {
     *        id: "1",
     *        customer: "2"
     *      }
     *   }
     *
     * With `relationshipName` being `customer` and `relationshipRecord`
     *
     *   {id: "2", name: "Rambo"}
     *
     * This method returns the following payload:
     *
     *   {
     *      cart: {
     *        id: "1",
     *        customer: "2"
     *      },
     *      _embedded: {
     *        customer: {
     *          id: "2",
     *          name: "Rambo"
     *        }
     *      }
     *   }
     *
     * which is then treated by the serializer later.
     *
     * @method addEmbeddedPayload
     * @private
     * @param {Object} payload
     * @param {String} relationshipName
     * @param {Object} relationshipRecord
     */
    addEmbeddedPayload: function addEmbeddedPayload(payload, relationshipName, relationshipRecord) {
      var objectHasId = relationshipRecord && relationshipRecord.id;
      var arrayHasIds = relationshipRecord.length && relationshipRecord.isEvery("id");
      var isValidRelationship = objectHasId || arrayHasIds;

      if (isValidRelationship) {
        if (!payload._embedded) {
          payload._embedded = {};
        }

        payload._embedded[relationshipName] = relationshipRecord;
        if (relationshipRecord.length) {
          payload[relationshipName] = relationshipRecord.mapBy('id');
        } else {
          payload[relationshipName] = relationshipRecord.id;
        }
      }

      if (this.isArray(payload[relationshipName])) {
        payload[relationshipName] = payload[relationshipName].filter(function (id) {
          return id;
        });
      }

      return payload;
    },

    isArray: function isArray(value) {
      return Object.prototype.toString.call(value) === '[object Array]';
    },

    /**
     * Same as `loadRelationships`, but for an array of records.
     *
     * @method loadRelationshipsForMany
     * @private
     * @param {DS.Model} type
     * @param {Object} recordsArray
     */
    loadRelationshipsForMany: function loadRelationshipsForMany(store, type, recordsArray) {
      var adapter = this,
          promise = _ember['default'].RSVP.resolve(_ember['default'].A([]));

      /**
       * Create a chain of promises, so the records are loaded sequentially.
       * Think of the variable promise as of the accumulator in a left fold.
       */
      recordsArray.forEach(function (record) {
        promise = promise.then(function (records) {
          return adapter.loadRelationships(store, type, record).then(function (loadedRecord) {
            records.push(loadedRecord);
            return records;
          });
        });
      });

      return promise;
    },

    /**
     *
     * @method relationshipProperties
     * @private
     * @param {DS.Model} type
     * @param {String} relationName
     */
    relationshipProperties: function relationshipProperties(type, relationName) {
      var relationships = _ember['default'].get(type, 'relationshipsByName');
      if (relationName) {
        return relationships.get(relationName);
      } else {
        return relationships;
      }
    }
  });

  exports['default'] = LSAdapter;
});