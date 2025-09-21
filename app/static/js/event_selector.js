var eventSelectorModule = (function() {
  var selectedEvent = '';
  var eventSelector = document.getElementById('event-selector');

  var selectListener = null;
  var unselectListener = null;

  var defaultEvt = '';
  var enableHash = true;

  return {
    eventSelector: eventSelector,

    eventClick: function() {
      if (this.dataset.eventid == selectedEvent) {
        if (unselectListener) {
          if (enableHash) {
            hashModule.deleteKey('e');
          }
          document.getElementById('event-selector-link-' + selectedEvent)
                  .getElementsByTagName('img')[0]
                  .classList.remove('selected');
          selectedEvent = '';
          unselectListener();
        }
      } else {
        if (selectedEvent) {
          document.getElementById('event-selector-link-' + selectedEvent)
                  .getElementsByTagName('img')[0]
                  .classList.remove('selected');
        }
        this.getElementsByClassName('event-selector-icon')[0].classList.add('selected');
        selectedEvent = this.dataset.eventid;
        if (enableHash) {
          if (this.dataset.eventid == defaultEvt) {
            hashModule.deleteKey('e');
          } else {
            hashModule.setValue('e', this.dataset.eventid);
          }
        }
        selectListener(this.dataset.eventid, this.dataset.eventname);
      }
    },

    unselect: function() {
      if (selectedEvent) {
        document.getElementById('event-selector-link-' + selectedEvent)
                .getElementsByTagName('img')[0]
                .classList.remove('selected');
        selectedEvent = '';
        hashModule.deleteKey('e');
        if (unselectListener) {
          unselectListener();
        }
      }
    },

    disableHash: function() { enableHash = false; },

    setSelectListener: function(listener) { selectListener = listener; },
    setUnselectListener: function(listener) { unselectListener = listener; },
    setDefaultEvt: function(evt) { defaultEvt = evt; },
    getDefaultEvt: function() { return defaultEvt; },
    setEvent: function(evt) {
      document.getElementById('event-selector-link-' + evt).click();
    }
  }
})();

onloadModule.register(function() {
  var events = document.getElementsByClassName('event-selector-link');

  for (var i = 0; i < events.length; i++) {
    events[i].onclick = eventSelectorModule.eventClick;
  }

  hash = hashModule.getValue('e');
  if (hash) {
    document.getElementById('event-selector-link-' + hash).click();
  } else if (eventSelectorModule.getDefaultEvt()) {
    document.getElementById('event-selector-link-' + eventSelectorModule.getDefaultEvt()).click();
  }
});
