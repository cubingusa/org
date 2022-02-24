var yearSelectorModule = (function() {
  var selectListener = null;

  return {
    yearSelect: function() {
      year = this.options[this.selectedIndex].value;
      selectListener(year);
      hashModule.setValue('y', year);
    },

    setSelectListener: function(listener) { selectListener = listener; },
  }
})();

onloadModule.register(function() {
  selector = document.getElementById('year-selector');
  selector.onchange = yearSelectorModule.yearSelect;

  hash = hashModule.getValue('y');
  if (hash) {
    var options = selector.getElementsByTagName('option');
    for (var i = 0; i < options.length; i++) {
      if (options[i].value == hash) {
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
