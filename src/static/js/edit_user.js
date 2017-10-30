editUserModule = (function() {
  var select = document.getElementById('state');
  var region = document.getElementById('region');
  var region_id = region.dataset.regionid;
  
  return {
    onStateChange: function() {
      selected = select.options[select.selectedIndex];
      region.classList.remove('region_' + region_id);
      region_id = selected.dataset.regionid;
      region.value = selected.dataset.regionname;
      region.classList.add('region_' + region_id);
    },
  };
})();

document.getElementById('state').onchange = editUserModule.onStateChange;
