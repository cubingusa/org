onloadModule = (function() {
  var earlyListeners = [];
  var listeners = [];

  return {
    register: function(listener) { listeners.push(listener); },

    registerEarly: function(listener) { earlyListeners.push(listener); },

    onload: function() {
      for (var i = 0; i < earlyListeners.length; i++) {
        earlyListeners[i]();
      };
      for (var i = 0; i < listeners.length; i++) {
        listeners[i]();
      };
    },
  };
})();

window.onload = onloadModule.onload; 
