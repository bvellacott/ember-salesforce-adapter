define('smack-ember-adapters/models/execute-anonymous-event', ['exports', 'ember-data/model', 'ember-data/attr'], function (exports, _emberDataModel, _emberDataAttr) {
	'use strict';

	// import { belongsTo, hasMany } from 'ember-data/relationships';

	exports['default'] = _emberDataModel['default'].extend({
		source: (0, _emberDataAttr['default'])('string'),
		arguments: (0, _emberDataAttr['default'])(),
		result: (0, _emberDataAttr['default'])(),
		success: (0, _emberDataAttr['default'])('boolean'),
		errorMessage: (0, _emberDataAttr['default'])('string')
	});
});