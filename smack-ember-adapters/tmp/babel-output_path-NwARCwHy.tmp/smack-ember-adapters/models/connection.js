define('smack-ember-adapters/models/connection', ['exports', 'ember-data', 'ember-data/attr'], function (exports, _emberData, _emberDataAttr) {
	'use strict';

	// import { belongsTo, hasMany } from 'ember-data/relationships';

	exports['default'] = _emberData['default'].Model.extend({
		username: (0, _emberDataAttr['default'])('string'),
		password: (0, _emberDataAttr['default'])('string'),
		session: (0, _emberDataAttr['default'])('string')
	});
});