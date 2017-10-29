selectCompEvent = function(event_id, event_name) {
  var elts = document.getElementsByClassName('competition-row-container');
  for (var i = 0; i < elts.length; i++) {
    evts = elts[i].dataset.evts.split(',');
    if (evts.includes(event_id)) {
      elts[i].style.display = '';
    } else {
      elts[i].style.display = 'none';
    }
  }
};

unselectCompEvent = function() {
  var elts = document.getElementsByClassName('competition-row-container');
  for (var i = 0; i < elts.length; i++) {
    elts[i].style.display = '';
  }
};
