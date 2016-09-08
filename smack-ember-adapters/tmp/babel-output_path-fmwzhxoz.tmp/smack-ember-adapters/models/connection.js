define('smack-ember-adapters/models/connection', ['exports', 'ember-data/model', 'ember-data/attr'], function (exports, _emberDataModel, _emberDataAttr) {
	'use strict';

	// import { belongsTo, hasMany } from 'ember-data/relationships';

	exports['default'] = _emberDataModel['default'].extend({
		username: (0, _emberDataAttr['default'])('string'),
		password: (0, _emberDataAttr['default'])('string'),
		session: (0, _emberDataAttr['default'])('string')
	});
});