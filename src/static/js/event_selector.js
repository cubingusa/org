var eventSelectorModule = (function() {
  var selectedEvent = '';
  var eventSelector = document.getElementById('event_selector');

  var selectListener = null;
  var unselectListener = null;

  var defaultEvt = '';
  
  return {
    eventSelector: eventSelector,

    eventClick: function() {
      if (this.dataset.eventid == selectedEvent) {
        if (unselectListener) {
          hashModule.deleteKey('e');
          document.getElementById('event_selector_link_' + selectedEvent)
                  .getElementsByTagName('img')[0]
                  .classList.remove('event_selector_icon_selected');
          selectedEvent = '';
          unselectListener();
        }
      } else {
        if (selectedEvent) {
          document.getElementById('event_selector_link_' + selectedEvent)
                  .getElementsByTagName('img')[0]
                  .classList.remove('event_selector_icon_selected');
        }
        this.getElementsByClassName('event_selector_icon')[0].classList.add('event_selector_icon_selected');
        selectedEvent = this.dataset.eventid;
        hashModule.setValue('e', this.dataset.eventid);
        selectListener(this.dataset.eventid, this.dataset.eventname);
      }
    },

    setSelectListener: function(listener) { selectListener = listener; },
    setUnselectListener: function(listener) { unselectListener = listener; },
    setDefaultEvt: function(evt) { defaultEvt = evt; },
    getDefaultEvt: function() { return defaultEvt; },
  }
})();

onloadModule.register(function() {
  var events = document.getElementsByClassName('event_selector_link');
  
  for (var i = 0; i < events.length; i++) {
    events[i].onclick = eventSelectorModule.eventClick;
  }

  hash = hashModule.getValue('e');
  if (hash) {
    document.getElementById('event_selector_link_' + hash).click();
  } else if (eventSelectorModule.getDefaultEvt()) {
    document.getElementById('event_selector_link_' + eventSelectorModule.getDefaultEvt()).click();
  }
});
