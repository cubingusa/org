var activeEvent = ''
var activeRegion = ''

var applyFilters = function() {
  var canShow = function(elt) {
    if (activeEvent != '') {
      evts = elt.dataset.evts.split(',');
      if (!evts.includes(activeEvent)) {
        return false;
      }
    }
    if (activeRegion != '') {
      elts = elt.getElementsByClassName('region_' + activeRegion);
      if (elts.length == 0) {
        return false;
      }
    }
    return true;
  };

  var rows = document.getElementsByClassName('competition-row-container');
  for (var i = 0; i < rows.length; i++) {
    if (canShow(rows[i])) {
      rows[i].style.display = '';
    } else {
      rows[i].style.display = 'none';
    }
  }
}

selectCompEvent = function(event_id, event_name) {
  activeEvent = event_id;
  applyFilters();
};

unselectCompEvent = function() {
  activeEvent = '';
  applyFilters();
};

selectCompRegion = function(region_id) {
  activeRegion = region_id;
  applyFilters();
}

unselectCompRegion = function() {
  activeRegion = '';
  applyFilters();
}
