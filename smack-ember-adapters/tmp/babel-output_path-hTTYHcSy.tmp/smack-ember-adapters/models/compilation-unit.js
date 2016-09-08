define('smack-ember-adapters/models/compilation-unit', ['exports', 'ember-data/model', 'ember-data/attr', 'ember-data/relationships'], function (exports, _emberDataModel, _emberDataAttr, _emberDataRelationships) {
	'use strict';

	exports['default'] = _emberDataModel['default'].extend({
		name: (0, _emberDataAttr['default'])('string'),
		pack: (0, _emberDataAttr['default'])('string'),
		funcNames: (0, _emberDataAttr['default'])(),
		source: (0, _emberDataAttr['default'])('string'),
		testData: (0, _emberDataRelationships.hasMany)('testDatum')
	});
});