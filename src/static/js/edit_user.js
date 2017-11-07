editUserModule = (function() {
  var select = document.getElementById('state');
  var region = document.getElementById('region');
  var region_id = region.dataset.regionid;
  
  return {
    onStateChange: function() {
      selected = select.options[select.selectedIndex];
      region.classList.remove('region-' + region_id);
      region_id = selected.dataset.regionid;
      region.value = selected.dataset.regionname;
      region.classList.add('region-' + region_id);
    },
  };
})();

document.getElementById('state').onchange = editUserModule.onStateChange;
