filterModule = (function() {
  var handler = '';

  return {
    changeListener: function(evt) {
      var req = new XMLHttpRequest();
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          if (req.status == 200) {
            document.getElementById('filter-table').innerHTML = req.responseText;
          } else {
            document.getElementById('filter-table').innerHTML = '';
          }
        }
      };

      var uri = handler + '/' + encodeURIComponent(document.getElementById('filter-box').value);
      req.open('GET', uri);
      req.send();
    },

    setAsyncHandler: function(newHandler) {
      handler = newHandler;
    },
  };
})();

document.getElementById('filter-box').addEventListener('change', filterModule.changeListener);
onloadModule.register(function() {
  filterModule.changeListener(null);
});
