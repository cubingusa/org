setChampionsTable = function(event_id) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (req.readyState == 4) {
      console.log(req);
      document.getElementById('champions-table').innerHTML = req.responseText;
    }
  };
  var uri = '/async/champions_by_year/' + event_id + '/national/us';
  req.open('GET', uri);
  req.send();
};
