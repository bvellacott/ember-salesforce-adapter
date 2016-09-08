define('dummy/tests/helpers/owner', ['exports', 'ember'], function (exports, _ember) {

  var Owner = undefined;

  if (_ember['default']._RegistryProxyMixin && _ember['default']._ContainerProxyMixin) {
    Owner = _ember['default'].Object.extend(_ember['default']._RegistryProxyMixin, _ember['default']._ContainerProxyMixin);
  } else {
    Owner = _ember['default'].Object.extend();
  }

  exports['default'] = Owner;
});