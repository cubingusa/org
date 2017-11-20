editUserModule = (function() {
  var select = document.getElementById('state');
  var region = document.getElementById('region');
  var region_id = region.dataset.regionid;

  var allowSubmission = function() {
    document.getElementById('form').submit();
  };
  
  return {
    onStateChange: function() {
      selected = select.options[select.selectedIndex];
      region.classList.remove('region-' + region_id);
      region_id = selected.dataset.regionid;
      region.value = selected.dataset.regionname;
      region.classList.add('region-' + region_id);
    },

    validate: function(event) {
      if (document.getElementById('lat').value ||
          !document.getElementById('city').value) {
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
      if (!document.getElementById('state').value) {
        return;
      }
      geocoderModule.geocode(document.getElementById('city').value,
                             document.getElementById('state').value,
                             function(geocoding_result) {
        console.log(geocoding_result);
        if (geocoding_result.status !== 'OK') {
          return;
        }
        geocoding_result.location.address_components.forEach(function(address_component) {
          address_component.types.forEach(function(type) {
            if (type == 'locality') {
              document.getElementById('city').value = address_component.long_name;
            }
          });
          document.getElementById('lat').value =
              Math.floor(geocoding_result.location.geometry.location.lat() * 1000000);
          document.getElementById('lng').value =
              Math.floor(geocoding_result.location.geometry.location.lng() * 1000000);
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
