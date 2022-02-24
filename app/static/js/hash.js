hashModule = (function() {
  var valueMap = {};
  var singleKey = '';

  var updateHash = function() {
    if (singleKey) {
      if (valueMap[singleKey]) {
        history.replaceState(null, null, '#' + valueMap[singleKey]);
      } else {
        history.replaceState(null, null, window.location.pathname);
      }
    } else {
      segments = []
      for (var key in valueMap) {
        segments.push(key + '=' + valueMap[key]);
      }
      if (segments) {
        history.replaceState(null, null, '#/' + segments.join('/'));
      } else {
        history.replaceState(null, null, window.location.pathname);
      }
    }
  };

  return {
    expectOneKey: function(key) {
      singleKey = key;
      valueMap[key] = window.location.hash.substring(1);
      updateHash();
    },

    setValue: function(key, value) {
      valueMap[key] = value;
      updateHash();
    },

    deleteKey: function(key) {
      delete valueMap[key];
      updateHash();
    },

    getValue: function(key) {
      if (valueMap[key] != undefined) {
        return valueMap[key];
      } else {
        return '';
      }
    },

    parseHash: function() {
      if (window.location.hash.length < 2) {
        return;
      }
      var hashSplit = window.location.hash.substring(2).split('/');
      for (var i = 0; i < hashSplit.length; i++) {
        var eltSplit = hashSplit[i].split('=', 2);
        if (eltSplit.length == 2) {
          valueMap[eltSplit[0]] = eltSplit[1];
        }
      }
    },
  };
})();

onloadModule.registerEarly(hashModule.parseHash);
