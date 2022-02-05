var regionSelectorModule = (function() {
  var selectedRegion = '';
  var regionSelector = document.getElementById('region-selector');
  var selectListener = null;
  var unselectListener = null;
  
  return {
    regionSelector: regionSelector,

    regionClick: function() {
      if (this.dataset.regionid == selectedRegion) {
        if (unselectListener) {
          hashModule.deleteKey('r');
          document.getElementById('region-selector-link-' + selectedRegion)
                  .getElementsByClassName('region-selector-item')[0]
                  .classList.remove('selected');
          selectedRegion = '';
          unselectListener();
        }
      } else {
        if (selectedRegion) {
          document.getElementById('region-selector-link-' + selectedRegion)
                  .getElementsByClassName('region-selector-item')[0]
                  .classList.remove('selected');
        }
        this.getElementsByClassName('region-selector-item')[0].classList.add('selected');
        selectedRegion = this.dataset.regionid;
        hashModule.setValue('r', this.dataset.regionid);
        selectListener(this.dataset.regionid);
      }
    },

    setSelectListener: function(listener) { selectListener = listener; },
    setUnselectListener: function(listener) { unselectListener = listener; },
  }
})();
  
onloadModule.register(function() {
  var regions = document.getElementsByClassName('region-selector-link');
  for (var i = 0; i < regions.length; i++) {
    regions[i].onclick = regionSelectorModule.regionClick;
  }

  hash = hashModule.getValue('r')
  if (hash) {
    document.getElementById('region-selector-link-' + hash).click();
  }
});
