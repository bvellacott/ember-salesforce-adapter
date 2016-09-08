define('smack-ember-adapters/models/test-datum', ['exports', 'ember-data/model', 'ember-data/attr', 'ember-data/relationships'], function (exports, _emberDataModel, _emberDataAttr, _emberDataRelationships) {
	'use strict';

	exports['default'] = _emberDataModel['default'].extend({
		name: (0, _emberDataAttr['default'])('string'),
		arguments: (0, _emberDataAttr['default'])(),
		unit: (0, _emberDataRelationships.belongsTo)('compilationUnit')
	});
});