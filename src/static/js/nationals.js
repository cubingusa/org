var nationalsModule = (function() {
  return {
    setChampionsTable: function(event_id, event_name) {
      var req = new XMLHttpRequest();
      document.getElementById('nats-spinner').style.display = 'inherit';
      document.getElementById('champions-table').innerHTML = '';
      document.getElementById('champions-table').classList.remove('fade-in');
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          document.getElementById('nats-spinner').style.display = 'none';
          if (req.status == 200) {
            document.getElementById('nationals-evt').innerHTML = event_name;
            document.getElementById('champions-table').innerHTML = req.responseText;
            document.getElementById('champions-table').classList.add('fade-in');
          } else {
            document.getElementById('nationals-evt').innerHTML = '';
          }
        }
      };
      var uri = '/async/champions_table/' + event_id + '/national/us';
      req.open('GET', uri);
      req.send();
    },
  };
})();

eventSelectorModule.setSelectListener(nationalsModule.setChampionsTable);
eventSelectorModule.setDefaultEvt('333');
hashModule.expectOneKey('e');
