var regionalsModule = (function() {
  var event_id = '';
  var event_name = '';
  var year = document.getElementById('year').dataset.year;
  var yearSelect = document.getElementById('year-select');
  var region = null;
  var regionName = null;
  var regionSelect = document.getElementById('region-select');

  var setChampionsTable = function() {
    var req = new XMLHttpRequest();
    document.getElementById('regionals-spinner').style.display = 'inherit';
    document.getElementById('champions-table').innerHTML = '';
    document.getElementById('champions-table').classList.remove('fade-in');
    req.onreadystatechange = function() {
      if (req.readyState == 4) {
        document.getElementById('regionals-spinner').style.display = 'none';
        if (req.status == 200) {
          if (year) {
            document.getElementById('regionals-yr').innerHTML = year;
          } else {
            document.getElementById('regionals-yr').innerHTML = regionName;
          }
          document.getElementById('regionals-evt').innerHTML = event_name;
          document.getElementById('champions-table').innerHTML = req.responseText;
          document.getElementById('champions-table').classList.add('fade-in');
        } else {
          document.getElementById('regionals-evt').innerHTML = '';
        }
        if (year >= 2020) {
          document.getElementById('event-selector-link-333ft').style.display = 'none';
        } else {
          document.getElementById('event-selector-link-333ft').style.display = 'inline';
        }
      }
    };
    var championshipType = document.getElementById('type').dataset.type;
    var uri;
    if (year !== null) {
      uri = '/async/champions_by_region/' + event_id + '/' + championshipType + '/' + year;
    } else {
      uri = '/async/champions_by_year/' + event_id + '/' + championshipType + '/' + region;
    }
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

    registerSelectors: function() {
      yearSelect.selectedIndex = 1;
      yearSelect.onchange = function() {
        if (yearSelect.selectedIndex > 0) {
          year = yearSelect.options[yearSelect.selectedIndex].value;
          regionSelect.selectedIndex = 0;
          region = null;
          setChampionsTable();
        }
      }
      regionSelect.onchange = function() {
        if (regionSelect.selectedIndex > 0) {
          region = regionSelect.options[regionSelect.selectedIndex].value;
          regionName = regionSelect.options[regionSelect.selectedIndex].text;
          yearSelect.selectedIndex = 0;
          year = null;
          setChampionsTable();
        }
      }
    }
  };
})();

eventSelectorModule.setSelectListener(regionalsModule.updateEvent);
eventSelectorModule.setDefaultEvt('333');
hashModule.expectOneKey('e');
onloadModule.register(regionalsModule.registerSelectors);
