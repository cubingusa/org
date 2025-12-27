var nationalsModule = (function() {
  return {
    setChampionsTable: function(event_id, event_name) {
      var req = new XMLHttpRequest();
      document.getElementById('nats-spinner').style.display = 'inherit';
      document.getElementById('nats-champions-table').innerHTML = '';
      document.getElementById('nats-champions-table').classList.remove('fade-in');
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          document.getElementById('nats-spinner').style.display = 'none';
          if (req.status == 200) {
            document.getElementById('nats-evt').innerHTML = event_name;
            document.getElementById('nats-champions-table').innerHTML = req.responseText;
            document.getElementById('nats-champions-table').classList.add('fade-in');
          } else {
            document.getElementById('nats-evt').innerHTML = '';
          }
        }
      };
      var uri = '/async/champions_by_year/' + event_id + '/national/us';
      req.open('GET', uri);
      req.send();

      nacReq = new XMLHttpRequest();
      document.getElementById('nac-spinner').style.display = 'inherit';
      document.getElementById('nac-champions-table').innerHTML = '';
      document.getElementById('nac-champions-table').classList.remove('fade-in');
      nacReq.onreadystatechange = function() {
        if (nacReq.readyState == 4) {
          document.getElementById('nac-spinner').style.display = 'none';
          if (nacReq.status == 200) {
            document.getElementById('nac-evt').innerHTML = event_name;
            document.getElementById('nac-champions-table').innerHTML = nacReq.responseText;
            document.getElementById('nac-champions-table').classList.add('fade-in');
          } else {
            document.getElementById('nac-evt').innerHTML = '';
          }
        }
      };
      uri = '/async/champions_by_year/' + event_id + '/nac/us';
      nacReq.open('GET', uri);
      nacReq.send();
    },
  };
})();

eventSelectorModule.setSelectListener(nationalsModule.setChampionsTable);
eventSelectorModule.setDefaultEvt('333');
hashModule.expectOneKey('e');
