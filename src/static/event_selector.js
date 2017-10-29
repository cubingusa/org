var selectedEvent = '';

var eventClick = function() {
  if (this.dataset.eventid == selectedEvent) {
    if (this.parentElement.dataset.unselect) {
      history.replaceState(null, null, '#');
      document.getElementById('event_selector_link_' + selectedEvent)
              .getElementsByTagName('img')[0]
              .classList.remove('event_selector_icon_selected');
      selectedEvent = '';
      callbackName = this.parentElement.dataset.unselectcallback;
      window[callbackName]();
    }
  } else {
    if (selectedEvent) {
      document.getElementById('event_selector_link_' + selectedEvent)
              .getElementsByTagName('img')[0]
              .classList.remove('event_selector_icon_selected');
    }
    this.getElementsByClassName('event_selector_icon')[0].classList.add('event_selector_icon_selected');
    selectedEvent = this.dataset.eventid;
    history.replaceState(null, null, '#' + this.dataset.eventid);
    callbackName = this.parentElement.dataset.callback;
    window[callbackName](this.dataset.eventid, this.dataset.eventname);
  }
}

var events = document.getElementsByClassName('event_selector_link');
for (var i = 0; i < events.length; i++) {
  events[i].onclick = eventClick;
}

window.onload = function() {
  if (window.location.hash) {
    document.getElementById('event_selector_link_' + window.location.hash.substring(1)).click();
  } else if (document.getElementById('event_selector').dataset.autoselect == '1') {
    document.getElementById('event_selector_link_333').click();
  }
}
