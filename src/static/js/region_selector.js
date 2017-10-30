var regionSelectorModule = (function() {
  var selectedRegion = '';
  var regionSelector = document.getElementById('region_selector');
  var selectListener = null;
  var unselectListener = null;
  
  return {
    regionSelector: regionSelector,

    regionClick: function() {
      if (this.dataset.regionid == selectedRegion) {
        if (unselectListener) {
          history.replaceState(null, null, '#');
          document.getElementById('region_selector_link_' + selectedRegion)
                  .getElementsByClassName('region_selector_item')[0]
                  .classList.remove('region_selector_item_selected');
          selectedRegion = '';
          unselectListener();
        }
      } else {
        if (selectedRegion) {
          document.getElementById('region_selector_link_' + selectedRegion)
                  .getElementsByClassName('region_selector_item')[0]
                  .classList.remove('region_selector_item_selected');
        }
        this.getElementsByClassName('region_selector_item')[0].classList.add('region_selector_item_selected');
        selectedRegion = this.dataset.regionid;
        history.replaceState(null, null, '#' + this.dataset.regionid);
        selectListener(this.dataset.regionid);
      }
    },

    setSelectListener: function(listener) { selectListener = listener; },
    setUnselectListener: function(listener) { unselectListener = listener; },
  }
})();
  
onloadModule.register(function() {
  var regions = document.getElementsByClassName('region_selector_link');
  for (var i = 0; i < regions.length; i++) {
    regions[i].onclick = regionSelectorModule.regionClick;
  }

  if (window.location.hash) {
    document.getElementById('region_selector_link_' + window.location.hash.substring(1)).click();
  }
});
