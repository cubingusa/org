var stateRankingsModule = (function() {
  var activeEventId = '';
  var activeEventName = '';

  var activeStateId = '';
  var activeStateName = '';

  var activeAverage = 1;

  updateTable = function() {
    if (!activeStateId || !activeEventId) {
      return;
    }
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState == 4) {
        if (req.status == 200) {
          document.getElementById('state-rankings-table').innerHTML = req.responseText;
          document.getElementById('header').innerHTML =
              activeStateName + ' ' + activeEventName + ' Rankings';
        } else {
          document.getElementById('state-rankings-table').innerHTML = '';
          document.getElementById('header').innerHTML = 'State Rankings';
        }
      }
    };
    var uri = '/async/state_rankings/'
        + activeEventId + '/'
        + activeStateId + '/'
        + activeAverage;
    req.open('GET', uri);
    req.send();
  }

  return {
    setEvent: function(event_id, event_name) {
      activeEventId = event_id;
      activeEventName = event_name;
      updateTable();
    },

    setState: function(state_id, state_name) {
      activeStateId = state_id;
      activeStateName = state_name;
      updateTable();
    },
  };
})();

eventSelectorModule.setSelectListener(stateRankingsModule.setEvent);
eventSelectorModule.setDefaultEvt('333');
stateSelectorModule.setSelectListener(stateRankingsModule.setState);
