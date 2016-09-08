import Smack from 'npm:smack-js-compiler';
// import { toStorageForm, fromStorageForm } from 'smack-ember-adapters/adapters/storageForm';

var compile = Smack.compile;
var getPackage = Smack.getPackage;
var createPackage = Smack.createPackage;
var removePackage = Smack.removePackage;

function deserialiseNamespace(nsString) {
	var ns = JSON.parse(nsString);
	evalPack(ns);
	return ns;
}

function evalPack(pack) {
	for (var key in pack) {
		if (key === '_f') evalFuncs(pack._f);else evalPack(pack[key]);
	}
}

function evalFuncs(_f) {
	for (var key in _f) {
		eval('_f[key] = ' + _f[key]);
	}
}

var namespace = localStorage.getItem('smackNs');
if (namespace && typeof namespace === 'string') namespace = deserialiseNamespace(namespace);else namespace = {};

var serialiseNamespace = function serialiseNamespace() {
	var nsCopy = copyPackForSerialising(namespace);
	localStorage.setItem('smackNs', JSON.stringify(nsCopy));
};

var copyPackForSerialising = function copyPackForSerialising(pack) {
	var copy = {};
	for (var key in pack) {
		if (key === '_f') copy._f = copyFuncsForSerialising(pack._f);else copy[key] = copyPackForSerialising(pack[key]);
	}
	return copy;
};

var copyFuncsForSerialising = function copyFuncsForSerialising(_f) {
	var copy = {};
	for (var key in _f) copy[key] = _f[key].toString();
	return copy;
};

var getPackNamespace = function getPackNamespace(pack) {
	if (pack === '') return namespace;
	if (typeof pack === 'string') pack = pack.split('.');
	var current = namespace;
	for (var i = 0; i < pack.length; i++) current = current[pack[i]];
	return current;
};

var getFuncNamespace = function getFuncNamespace(pack) {
	return getPackNamespace(pack)._f;
};

var compileAndReturnAnonymousFunc = function compileAndReturnAnonymousFunc(source, argNames) {
	removePackage('anonymous', namespace);
	createPackage('anonymous', namespace);
	var anonFuncSrc = 'func anonymous(' + argNames.join(', ') + ') {\n' + source + '\n' + generateReturnObjectAssignSrc('_rEToBJ_', argNames) + '\n}';
	var unit = compile('anonymous', anonFuncSrc, namespace);
	console.log(anonFuncSrc);
	return namespace.anonymous._f.anonymous;
};

var generateReturnObjectAssignSrc = function generateReturnObjectAssignSrc(objName, argNames) {
	var src = objName + ' = {};\n';
	for (var i = 0; i < argNames.length; i++) src += objName + '["' + argNames[i] + '"] = ' + argNames[i] + ';\n';
	src += 'ret ' + objName + ';\n';
	return src;
};

var getPackSequence = function getPackSequence(packRec, hash) {
	if (!hash['package']) hash['package'] = { records: {} };
	var records = hash['package'].records;
	if (typeof packRec === 'string') packRec = records[packRec];
	var sequence = [];
	for (var cur = packRec; !!cur; cur = records[cur.parent]) sequence.push(cur.name);
	return sequence.reverse();
};

var doNothing = function doNothing() {};

var findHandlers = {
	connection: function connection(con, hash) {
		con.password = null;
	}
};

var validate = {
	'compilation-unit': function compilationUnit(unitRec, hash) {
		if (!hash['package'].records[unitRec.pack]) throw 'a compilation unit must have a reference to an existing package';
	}
};

var beforeCreateHandlers = {
	'connection': function connection(_connection, hash) {
		_connection.session = 'mock session id';
		return {};
	},
	'package': function _package(packageRec, hash) {
		var pack = getPackSequence(packageRec, hash);
		createPackage(pack, namespace);
		serialiseNamespace();
		return {};
	},
	'compilation-unit': function compilationUnit(unitRec, hash) {
		validate['compilation-unit'](unitRec, hash);
		var pack = getPackSequence(unitRec.pack, hash);
		var unit = null;
		unit = compile(pack, unitRec.source, namespace);
		//		unitRec.pack = unit.pack;
		unitRec.funcNames = unit.funcNames;
		serialiseNamespace();
		return {};
	},
	'execute-event': function executeEvent(execRec, hash) {
		try {
			var pack = execRec.name.split('.');
			var name = pack.pop();
			var func = getFuncNamespace(pack)[name];
			execRec.result = func.apply(namespace, execRec.arguments);
			execRec.success = true;
		} catch (e) {
			execRec.success = false;
			execRec.errorMessage = e;
		}
		return {};
	},
	'execute-anonymous-event': function executeAnonymousEvent(execRec, hash) {
		try {
			var args = execRec.arguments;
			var argNames = [];
			var argValues = [];
			for (var argName in args) {
				argNames.push(argName);
				argValues.push(args[argName]);
			}
			var func = compileAndReturnAnonymousFunc(execRec.source, argNames);
			serialiseNamespace();
			execRec.result = func.apply(namespace, argValues);
			execRec.success = true;
		} catch (e) {
			execRec.success = false;
			execRec.errorMessage = e;
		}
		return {};
	}
};

var afterCreateHandlers = {};

var beforeDeleteHandlers = {
	'package': function _package(packageRec, hash) {
		var pack = getPackSequence(packageRec, hash);
		removePackage(pack, namespace);
		serialiseNamespace();
	},
	'compilation-unit': function compilationUnit(unitRec, hash) {
		var oldRec = hash['compilation-unit'].records[unitRec.id];
		var pack = getPackSequence(oldRec.pack, hash);
		var funcs = getFuncNamespace(pack);
		var funcNames = oldRec.funcNames;
		for (var i = 0; i < funcNames.length; i++) delete funcs[funcNames[i]];
		serialiseNamespace();
	}
};

var afterDeleteHandlers = {};

var beforeUpdateHandlers = {
	'package': function _package(packageRec, hash) {
		//		throw "package updating isn't currently supported";
	},
	'compilation-unit': function compilationUnit(unitRec, hash) {
		validate['compilation-unit'](unitRec, hash);
		beforeDeleteHandlers['compilation-unit'](unitRec, hash);
		beforeCreateHandlers['compilation-unit'](unitRec, hash);
	}
};

var afterUpdateHandlers = {};

export default {
	setNamespace: function setNamespace(ns) {
		this._ns = namespace = ns;
	},
	_ns: namespace,
	getPackNamespace: getPackNamespace,
	getFuncNamespace: getFuncNamespace,
	onFind: function onFind(hash, type, result, allowRecursive) {
		var handle = findHandlers[type.modelName];
		if (handle) handle(result, hash);
	},
	onFindMany: function onFindMany(hash, type, result, allowRecursive) {
		var handle = findHandlers[type.modelName];
		for (var i = 0; handle && i < result.length; i++) handle(result[i], hash);
	},
	onQuery: function onQuery(hash, type, result, allowRecursive) {
		var handle = findHandlers[type.modelName];
		for (var i = 0; handle && i < result.length; i++) handle(result[i], hash);
	},
	onFindAll: function onFindAll(hash, type, result) {
		var handle = findHandlers[type.modelName];
		for (var i = 0; handle && i < result.length; i++) handle(result[i], hash);
	},
	beforeCreate: function beforeCreate(hash, type, result) {
		var handle = beforeCreateHandlers[type.modelName];
		if (handle) handle(result, hash);
	},
	afterCreate: function afterCreate(hash, type, result) {
		var handle = afterCreateHandlers[type.modelName];
		if (handle) handle(result, hash);
	},
	beforeUpdate: function beforeUpdate(hash, type, result) {
		var handle = beforeUpdateHandlers[type.modelName];
		if (handle) handle(result, hash);
	},
	afterUpdate: function afterUpdate(hash, type, result) {
		var handle = afterUpdateHandlers[type.modelName];
		if (handle) handle(result, hash);
	},
	beforeDelete: function beforeDelete(hash, type, result) {
		var handle = beforeDeleteHandlers[type.modelName];
		if (handle) handle(result, hash);
	},
	afterDelete: function afterDelete(hash, type, result) {
		var handle = afterDeleteHandlers[type.modelName];
		if (handle) handle(result, hash);
	}
};