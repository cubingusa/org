onloadModule = (function() {
  var listeners = [];

  return {
    register: function(listener) {
      listeners.push(listener);
    },
    onload: function() {
      for (var i = 0; i < listeners.length; i++) {
        listeners[i]();
      };
    },
  };
})();

window.onload = onloadModule.onload; 
