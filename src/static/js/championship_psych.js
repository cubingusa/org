var stateRankingsModule = (function() {
  var activeEventId = '';
  var activeEventName = '';
  var championshipId = document.getElementById('championship-id').dataset.championshipid;

  updateTable = function() {
    if (!activeEventId) {
      return;
    }
    var req = new XMLHttpRequest();
    document.getElementById('championship-psych-spinner').style.display = 'inherit';
    document.getElementById('championship-psych-table').innerHTML = '';
    document.getElementById('championship-psych-table').classList.remove('fade-in');
    req.onreadystatechange = function() {
      if (req.readyState === 4) {
        document.getElementById('championship-psych-spinner').style.display = 'none';
        if (req.status === 200) {
          document.getElementById('championship-psych-table').classList.add('fade-in');
          document.getElementById('championship-psych-table').innerHTML = req.responseText;
        }
      }
    };
    var uri = '/async/championship_psych/'
        + championshipId + '/'
        + activeEventId;
    req.open('GET', uri);
    req.send();
  }

  return {
    setEvent: function(event_id, event_name) {
      activeEventId = event_id;
      activeEventName = event_name;
      updateTable();
    },
  };
})();

eventSelectorModule.setSelectListener(stateRankingsModule.setEvent);
eventSelectorModule.setDefaultEvt('333');
