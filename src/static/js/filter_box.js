filterModule = (function() {
  var handler = '';

  return {
    changeListener: function(evt) {
      var req = new XMLHttpRequest();
      document.getElementById('filter-spinner').style.display = 'inherit';
      document.getElementById('filter-table').innerHTML = '';
      document.getElementById('filter-table').classList.remove('fade-in');
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
        document.getElementById('filter-spinner').style.display = 'none';
          if (req.status == 200) {
            document.getElementById('filter-table').innerHTML = req.responseText;
            document.getElementById('filter-table').classList.add('fade-in');
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
