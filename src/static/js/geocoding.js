var geocoderModule = (function() {
  var geocoder = new google.maps.Geocoder();

  var locationCache = {}

  return {
    geocode: function(city, state, callback) {
      cacheKey = city + ', ' + state;
      console.log(cacheKey);
      
      if (cacheKey in locationCache) {
        callback(locationCache[cacheKey]);
        return;
      }

      geocoder.geocode({
        componentRestrictions: {
          locality: city,
          administrativeArea: state,
          country: 'US',
        }
      }, function(results, status) {
        locationCache[cacheKey] = {
          'status': status,
        }
        if (status == 'OK') {
          locationCache[cacheKey].location = results[0];
        }
        callback(locationCache[cacheKey]);
        return;
      });
    },
  };
})();
