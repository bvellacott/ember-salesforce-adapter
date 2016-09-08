define('smack-ember-adapters/adapters/smackHooks', ['exports', 'npm:smack-js-compiler'], function (exports, _npmSmackJsCompiler) {
	'use strict';

	var namespace = {};

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
		delete namespace.anonymous;
		var anonFuncSrc = 'pack anonymous;\n func anonymous(' + argNames.join(', ') + ') {\n' + source + '\n' + generateReturnObjectAssignSrc('_rEToBJ_', argNames) + '\n}';
		var unit = (0, _npmSmackJsCompiler['default'])(name, anonFuncSrc, namespace);
		console.log(anonFuncSrc);
		return namespace.anonymous._f.anonymous;
	};

	var generateReturnObjectAssignSrc = function generateReturnObjectAssignSrc(objName, argNames) {
		var src = objName + ' = {};\n';
		for (var i = 0; i < argNames.length; i++) src += objName + '["' + argNames[i] + '"] = ' + argNames[i] + ';\n';
		src += 'ret ' + objName + ';\n';
		return src;
	};

	var doNothing = function doNothing() {};

	var findHandlers = {
		connection: function connection(con) {
			con.set('password', null);
		}
	};

	var beforeCreateHandlers = {
		'connection': function connection(_connection) {
			_connection.set('session', 'mock session id');
		},
		'compilation-unit': function compilationUnit(unitRec) {
			var unit = null;
			unit = (0, _npmSmackJsCompiler['default'])(unitRec.get('name'), unitRec.get('source'), namespace);
			unitRec.set('pack', unit.pack);
			unitRec.set('funcNames', unit.funcNames);
		},
		'execute-event': function executeEvent(execRec) {
			try {
				var pack = execRec.get('name').split('.');
				var name = pack.pop();
				var func = getFuncNamespace(pack)[name];
				execRec.set('result', func.apply(namespace, execRec.get('arguments')));
				execRec.set('success', true);
			} catch (e) {
				execRec.set('success', false);
				execRec.set('errorMessage', e);
			}
		},
		'execute-anonymous-event': function executeAnonymousEvent(execRec) {
			try {
				var args = execRec.get('arguments');
				var argNames = [];
				var argValues = [];
				for (var argName in args) {
					argNames.push(argName);
					argValues.push(args[argName]);
				}
				var func = compileAndReturnAnonymousFunc(execRec.get('source'), argNames);
				execRec.set('result', func.apply(namespace, argValues));
				execRec.set('success', true);
			} catch (e) {
				execRec.set('success', false);
				execRec.set('errorMessage', e);
			}
		}
	};

	var afterCreateHandlers = {};

	var beforeDeleteHandlers = {
		'compilation-unit': function compilationUnit(unitRec) {
			var funcs = getFuncNamespace(unitRec.get('pack'));
			var funcNames = unitRec.get('funcNames');
			for (var i = 0; i < funcNames.length; i++) delete funcs[funcNames[i]];
		}
	};

	var afterDeleteHandlers = {};

	var beforeUpdateHandlers = {
		'compilation-unit': function compilationUnit(unitRec) {
			beforeDeleteHandlers['compilation-unit'](unitRec);
			beforeCreateHandlers['compilation-unit'](unitRec);
		}
	};

	var afterUpdateHandlers = {};

	exports['default'] = {
		getPackNamespace: getPackNamespace,
		getFuncNamespace: getFuncNamespace,
		onFind: function onFind(store, type, result, allowRecursive) {
			var handle = findHandlers[type];
			if (handle) handle(result);
		},
		onFindMany: function onFindMany(store, type, result, allowRecursive) {
			var handle = findHandlers[type];
			for (var i = 0; handle && i < result.length; i++) handle(result[i]);
		},
		onQuery: function onQuery(store, type, result, allowRecursive) {
			var handle = findHandlers[type];
			for (var i = 0; handle && i < result.length; i++) handle(result[i]);
		},
		onFindAll: function onFindAll(store, type, result) {
			var handle = findHandlers[type];
			for (var i = 0; handle && i < result.length; i++) handle(result[i]);
		},
		beforeCreate: function beforeCreate(store, type, result) {
			var handle = beforeCreateHandlers[type];
			if (handle) handle(result);
		},
		afterCreate: function afterCreate(store, type, result) {
			var handle = afterCreateHandlers[type];
			if (handle) handle(result);
		},
		beforeUpdate: function beforeUpdate(store, type, result) {
			var handle = beforeUpdateHandlers[type];
			if (handle) handle(result);
		},
		afterUpdate: function afterUpdate(store, type, result) {
			var handle = afterUpdateHandlers[type];
			if (handle) handle(result);
		},
		beforeDelete: function beforeDelete(store, type, result) {
			var handle = beforeDeleteHandlers[type];
			if (handle) handle(result);
		},
		afterDelete: function afterDelete(store, type, result) {
			var handle = afterDeleteHandlers[type];
			if (handle) handle(result);
		}
	};
});