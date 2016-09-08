define('smack-ember-adapters/serializers/ls-serializer', ['exports', 'ember', 'ember-data'], function (exports, _ember, _emberData) {
  'use strict';

  exports['default'] = _emberData['default'].JSONSerializer.extend({
    /**
     * Invokes the new serializer API.
     * This should be removed in 2.0
     */
    isNewSerializerAPI: true,

    serializeHasMany: function serializeHasMany(snapshot, json, relationship) {
      var key = relationship.key;
      var payloadKey = this.keyForRelationship ? this.keyForRelationship(key, "hasMany") : key;
      var relationshipType = snapshot.type.determineRelationshipType(relationship, this.store);

      if (relationshipType === 'manyToNone' || relationshipType === 'manyToMany' || relationshipType === 'manyToOne') {
        json[payloadKey] = snapshot.hasMany(key, { ids: true });
        // TODO support for polymorphic manyToNone and manyToMany relationships
      }
    },

    /**
     * Extracts whatever was returned from the adapter.
     *
     * If the adapter returns relationships in an embedded way, such as follows:
     *
     * ```js
     * {
     *   "id": 1,
     *   "title": "Rails Rambo",
     *
     *   "_embedded": {
     *     "comment": [{
     *       "id": 1,
     *       "comment_title": "FIRST"
     *     }, {
     *       "id": 2,
     *       "comment_title": "Rails is unagi"
     *     }]
     *   }
     * }
     *
     * this method will create separated JSON for each resource and then combine
     * the data and the embed payload into the JSON.Api spec for included objects
     * returning a single object.
     *
     * @method extractSingle
     * @private
     * @param {DS.Store} store the returned store
     * @param {DS.Model} type the type/model
     * @param {Object} payload returned JSON
     */
    normalizeSingleResponse: function normalizeSingleResponse(store, type, payload) {
      var _this = this;

      var included = _ember['default'].A([]);
      if (payload && payload._embedded) {
        var forEachFunc = function forEachFunc(record) {
          included.pushObject(_this.normalize(relType, record).data);
        };

        for (var relation in payload._embedded) {
          var relType = type.typeForRelationship(relation, store);
          var embeddedPayload = payload._embedded[relation];

          if (embeddedPayload) {
            if (_ember['default'].typeOf(embeddedPayload) === 'array') {
              embeddedPayload.forEach(forEachFunc);
            } else {
              included.pushObject(this.normalize(relType, embeddedPayload).data);
            }
          }
        }

        delete payload._embedded;
      }

      var normalPayload = this.normalize(type, payload);
      if (included.length > 0) {
        normalPayload.included = included;
      }
      return normalPayload;
    },

    /**
     * This is exactly the same as extractSingle, but used in an array.
     *
     * @method extractSingle
     * @private
     * @param {DS.Store} store the returned store
     * @param {DS.Model} type the type/model
     * @param {Array} payload returned JSONs
     */
    normalizeArrayResponse: function normalizeArrayResponse(store, type, payload) {
      var _this2 = this;

      var response = { data: _ember['default'].A([]), included: _ember['default'].A([]) };
      payload.forEach(function (json) {
        var normalized = _this2.normalizeSingleResponse(store, type, json);
        response.data.pushObject(normalized.data);

        if (normalized.included) {
          normalized.included.forEach(function (included) {
            if (!response.included.contains(included.id)) {
              response.included.addObject(included);
            }
          });
        }
      });

      return response;
    }
  });
});