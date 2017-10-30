var nationalsModule = (function() {
  return {
    setChampionsTable: function(event_id, event_name) {
      var req = new XMLHttpRequest();
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          if (req.status == 200) {
            document.getElementById('nationals-evt').innerHTML = event_name;
            document.getElementById('champions-table').innerHTML = req.responseText;
          } else {
            document.getElementById('nationals-evt').innerHTML = '';
            document.getElementById('champions-table').innerHTML = '';
          }
        }
      };
      var uri = '/async/champions_by_year/' + event_id + '/national/us';
      req.open('GET', uri);
      req.send();
    },
  };
})();

eventSelectorModule.setSelectListener(nationalsModule.setChampionsTable);
eventSelectorModule.setDefaultEvt('333');
hashModule.expectOneKey('e');
