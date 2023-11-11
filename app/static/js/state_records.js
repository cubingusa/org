var stateRecordsModule = (function() {
  var activeEventId = '';
  var activeEventName = '';

  var activeStateId = '';
  var activeStateName = '';

  var activeAverage = '';

  updateTable = function() {
    if ((!activeStateId && !activeEventId) || activeAverage === '') {
      return;
    }
    var req = new XMLHttpRequest();
    document.getElementById('state-records-spinner').style.display = 'inherit';
    document.getElementById('state-records-table').innerHTML = '';
    document.getElementById('state-records-table').classList.remove('fade-in');
    req.onreadystatechange = function() {
      if (req.readyState === 4) {
        document.getElementById('state-records-spinner').style.display = 'none';
        if (req.status === 200) {
          document.getElementById('state-records-table').classList.add('fade-in');
          document.getElementById('state-records-table').innerHTML = req.responseText;
          document.getElementById('header').innerHTML =
              activeStateName + ' ' + activeEventName + ' Records';
        } else {
          document.getElementById('header').innerHTML = 'State Records';
        }
      }
    };
    if (activeEventId) {
      var uri = '/async/state_records/event/'
          + activeEventId + '/'
          + activeAverage;
      req.open('GET', uri);
      req.send();
    } else if (activeStateId) {
      var uri = '/async/state_records/state/'
          + activeStateId + '/'
          + activeAverage;
      req.open('GET', uri);
      req.send();
    }
  }

  return {
    setEvent: function(event_id, event_name) {
      activeEventId = event_id;
      activeEventName = event_name;

      activeStateId = '';
      activeStateName = '';
      stateSelectorModule.unselect();
      updateTable();
    },

    setState: function(state_id, state_name) {
      activeStateId = state_id;
      activeStateName = state_name;

      activeEventId = '';
      activeEventName = '';
      eventSelectorModule.unselect();
      updateTable();
    },

    setAverage: function(value) {
      activeAverage = value;
      if (activeAverage === '1') {
        document.getElementById('average').classList.add('single-average-button-active');
        document.getElementById('single').classList.remove('single-average-button-active');
      } else {
        document.getElementById('average').classList.remove('single-average-button-active');
        document.getElementById('single').classList.add('single-average-button-active');
      }
      hashModule.setValue('a', value);
      updateTable();
    }
  };
})();

eventSelectorModule.setSelectListener(stateRecordsModule.setEvent);
eventSelectorModule.setDefaultEvt('333');
stateSelectorModule.setSelectListener(stateRecordsModule.setState);

onloadModule.register(function() {
  var averageFromHash = hashModule.getValue('a');
  if (averageFromHash === '') {
    averageFromHash = '1';
  }
  stateRecordsModule.setAverage(averageFromHash);

  document.getElementById('average').onclick = function(evt) { stateRecordsModule.setAverage('1'); };
  document.getElementById('single').onclick = function(evt) { stateRecordsModule.setAverage('0'); };
});
