import Model from 'ember-data/model';
import attr from 'ember-data/attr';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	username: attr('string'),
	password: attr('string'),
	session: attr('string')
});