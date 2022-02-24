var stateSelectorModule = (function() {
  var selectListener = null;

  return {
    stateSelect: function() {
      state_id = this.options[this.selectedIndex].dataset.stateid;
      state_name = this.options[this.selectedIndex].dataset.statename;
      selectListener(state_id, state_name);
      hashModule.setValue('s', state_id);
    },

    setSelectListener: function(listener) { selectListener = listener; },
  }
})();

onloadModule.register(function() {
  selector = document.getElementById('state-selector');
  selector.onchange = stateSelectorModule.stateSelect;

  hash = hashModule.getValue('s');
  if (hash) {
    var options = selector.getElementsByTagName('option');
    for (var i = 0; i < options.length; i++) {
      if (options[i].dataset.stateid == hash) {
        selector.selectedIndex = i;
        break;
      }
    }
  }
  if (!selector.selectedIndex) {
    selector.selectedIndex = 0;
  }
  selector.onchange();
});
