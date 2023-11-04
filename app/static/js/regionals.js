var regionalsModule = (function() {
  var event_id = '';
  var event_name = '';
  var year = document.getElementById('year').dataset.year;

  var setChampionsTable = function() {
    var req = new XMLHttpRequest();
    document.getElementById('regionals-spinner').style.display = 'inherit';
    document.getElementById('champions-table').innerHTML = '';
    document.getElementById('champions-table').classList.remove('fade-in');
    req.onreadystatechange = function() {
      if (req.readyState == 4) {
        document.getElementById('regionals-spinner').style.display = 'none';
        if (req.status == 200) {
          document.getElementById('regionals-yr').innerHTML = year;
          document.getElementById('regionals-evt').innerHTML = event_name;
          document.getElementById('champions-table').innerHTML = req.responseText;
          document.getElementById('champions-table').classList.add('fade-in');
        } else {
          document.getElementById('regionals-evt').innerHTML = '';
        }
      }
    };
    var uri = '/async/champions_by_region/' + event_id + '/regional/' + year;
    req.open('GET', uri);
    req.send();
  };

  return {
    setChampionsTable: setChampionsTable,

    updateEvent: function(new_event_id, new_event_name) {
      event_id = new_event_id;
      event_name = new_event_name;
      setChampionsTable();
    },

    registerYearSelector: function() {
      document.getElementById('year-select').onchange = function() {
        var yearSelect = document.getElementById('year-select');
        year = yearSelect.options[yearSelect.selectedIndex].value;
        setChampionsTable();
      }
    }
  };
})();

eventSelectorModule.setSelectListener(regionalsModule.updateEvent);
eventSelectorModule.setDefaultEvt('333');
hashModule.expectOneKey('e');
onloadModule.register(regionalsModule.registerYearSelector);
