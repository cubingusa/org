document.getElementById('state').onchange = function() {
  select = document.getElementById('state');
  selected = select.options[select.selectedIndex];
  region = document.getElementById('region');

  old_region_id = region.dataset.regionid;
  region.dataset.regionid = selected.dataset.regionid;
  region.value = selected.dataset.regionname;
  region.classList.remove('region-' + old_region_id);
  region.classList.add('region-' + selected.dataset.regionid);
};
