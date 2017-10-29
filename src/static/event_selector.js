var eventClick = function() {
  history.replaceState(null, null, '#' + this.dataset.eventid);
  var imgs = document.getElementsByClassName('event_selector_icon_selected');
  for (var i = 0; i < imgs.length; i++) {
    imgs[i].classList.remove('event_selector_icon_selected');
  }
  this.getElementsByClassName('event_selector_icon')[0].classList.add('event_selector_icon_selected');

  callbackName = this.parentElement.dataset.callback;
  window[callbackName](this.dataset.eventid, this.dataset.eventname);
}

var events = document.getElementsByClassName('event_selector_link');
for (var i = 0; i < events.length; i++) {
  events[i].onclick = eventClick;
}

window.onload = function() {
  if (window.location.hash) {
    document.getElementById('event_selector_link_' + window.location.hash.substring(1)).click();
  } else {
    document.getElementById('event_selector_link_333').click();
  }
}
