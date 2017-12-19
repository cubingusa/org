eventSelectorModule.disableHash();
eventSelectorModule.setSelectListener(function(event_id, event_name) {
  Array.prototype.forEach.call(document.getElementsByClassName('selected-event'), function(elt) {
    elt.classList.remove('selected-event');
  });
  document.getElementById('eventinfo_' + event_id).classList.add('selected-event');
  document.getElementById('eventinfo_' + event_id).scrollIntoView({
    behavior: 'smooth',
  });
});
