editUserModule = (function() {
  var city = document.getElementById('city');
  var state = document.getElementById('state');
  var region = document.getElementById('region');
  var lat = document.getElementById('lat');
  var lng = document.getElementById('lng');

  var region_id = region.dataset.regionid;

  var geocodingFailed = document.getElementById('geocoding-failed');
  var stateMissing = document.getElementById('state-missing');

  var allowSubmission = function() {
    document.getElementById('form').submit();
  };
  
  return {
    onStateChange: function() {
      selected = state.options[state.selectedIndex];
      region.classList.remove('region-' + region_id);
      region_id = selected.dataset.regionid;
      region.value = selected.dataset.regionname;
      region.classList.add('region-' + region_id);
    },

    validate: function(event) {
      geocodingFailed.style.display = 'none';
      stateMissing.style.display = 'none';
      if (lat.value || !city.value) {
        // If we've already populated the latitude and longitude, or they didn't provide
        // a city, allow the submission.
        return;
      }
      if (typeof geocoderModule === 'undefined') {
        // If we don't have a maps API key, we can't geocode, so proceed with the submit.
        return;
      }
      // Prevent the submission from going through until we've confirmed geocode.
      event.preventDefault();
      event.stopPropagation();
      // If the user provides a city but not a state, require them to fix it.
      if (state.value === 'empty') {
        stateMissing.style.display = 'initial';
        return;
      }
      geocoderModule.geocode(city.value, state.value, function(geocoding_result) {
        if (geocoding_result.status !== 'OK') {
          geocodingFailed.style.display = 'initial';
          return;
        }
        geocoding_result.location.address_components.forEach(function(address_component) {
          address_component.types.forEach(function(type) {
            if (type == 'locality') {
              city.value = address_component.long_name;
            }
          });
          lat.value = Math.floor(geocoding_result.location.geometry.location.lat() * 1000000);
          lng.value = Math.floor(geocoding_result.location.geometry.location.lng() * 1000000);
          allowSubmission();
          return;
        });
      });
    },
  };
})();

onloadModule.register(function() {
  document.getElementById('state').onchange = editUserModule.onStateChange;
  document.getElementById('form').addEventListener('submit', editUserModule.validate);
});
