var selectedRegion = '';
var regionSelector = document.getElementById('region_selector');

var regionClick = function() {
  if (this.dataset.regionid == selectedRegion) {
    if (regionSelector.dataset.unselect) {
      history.replaceState(null, null, '#');
      document.getElementById('region_selector_link_' + selectedRegion)
              .getElementsByClassName('region_selector_item')[0]
              .classList.remove('region_selector_item_selected');
      selectedRegion = '';
      callbackName = regionSelector.dataset.unselectcallback;
      window[callbackName]();
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
    callbackName = regionSelector.dataset.callback;
    window[callbackName](this.dataset.regionid);
  }
}

var regions = document.getElementsByClassName('region_selector_link');
for (var i = 0; i < regions.length; i++) {
  regions[i].onclick = regionClick;
}

window.onload = function() {
  if (window.location.hash) {
    document.getElementById('region_selector_link_' + window.location.hash.substring(1)).click();
  }
}
