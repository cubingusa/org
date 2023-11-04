var editChampionshipsModule = (function() {
  var state_names = {};
  var state_regions = {};
  var region_names = {};
  var existing_championships = {};

  var updateChampionshipLink = function(competition_id, championship_type, is_pbq,
                                        championship_id, championship_name) {
    row = document.getElementById(championship_type + (is_pbq ? '-pbq' : '') + "-row");
    linkElt = row.getElementsByClassName("new-championship-link")[0];
    linkElt.href = "/admin/add_championship/" + competition_id + "/" + championship_type + "/" + championship_id;
    if (existing_championships[championship_id]) {
      linkElt.innerHTML = "Replace " + existing_championships[championship_id];
    } else {
      linkElt.innerHTML = "Add";
    }
    if (championship_type !== "national") {
      row.getElementsByClassName("championship-name")[0].innerHTML = championship_name;
    }

    row.style.display = "inherit";
  };

  var changeSelectedRegion = function() {
    var elt = document.getElementById('regional-pbq-selector');
    var region = elt.options[elt.selectedIndex].value;
    console.log('selected ' + region)
    updateChampionshipLink(competition_id, "regional", true,
                           region + "_" + competition_year + "_pbq",
                           region_names[region])
  };

  return {
    addState: function(state_id, region_id, state_name) {
      state_names[state_id] = state_name;
      state_regions[state_id] = region_id;
    },

    addRegion: function(region_id, region_name) {
      region_names[region_id] = region_name;
    },

    addChampionship: function(championship_id, competition_id) {
      existing_championships[championship_id] = competition_id;
    },

    onRegionSelect: function() {
      changeSelectedRegion();
    },

    setActiveCompetition: function() {
      selectedElement = this.options[this.selectedIndex];
      if (selectedElement === "_empty") {
        rows = document.getElementsByClassName("new-championship-row");
        Array.prototype.forEach.call(rows, function(elt) {
          elt.style.display = "none";
        });
        return;
      }
      competition_id = selectedElement.value;
      competition_state = selectedElement.dataset.state;
      if (competition_state == 'NONE') {
        competition_region = null
        document.getElementById('regional-pbq-selector').style.display = 'inherit';
        document.getElementById('regional-pbq-name').style.display = 'none';
      } else {
        competition_region = state_regions[competition_state];
        document.getElementById('regional-pbq-selector').style.display = 'none';
        document.getElementById('regional-pbq-name').style.display = 'inherit';
      }
      competition_year = selectedElement.dataset.year;

      changeSelectedRegion();
      if (competition_state == 'NONE') {
        document.getElementById('national-row').style.display = 'none';
        document.getElementById('regional-row').style.display = 'none';
        document.getElementById('state-row').style.display = 'none';
        document.getElementById('state-pbq-row').style.display = 'none';
      } else {
        updateChampionshipLink(competition_id, "national", false,
                               competition_year, "National");
        updateChampionshipLink(competition_id, "regional", false,
                               competition_region + "_" + competition_year,
                               region_names[competition_region]);
        updateChampionshipLink(competition_id, "regional", true,
                               competition_region + "_" + competition_year + "_pbq",
                               region_names[competition_region]);
        updateChampionshipLink(competition_id, "state", false,
                               competition_state + "_" + competition_year,
                               state_names[competition_state]);
        updateChampionshipLink(competition_id, "state", true,
                               competition_state + "_" + competition_year + "_pbq",
                               state_names[competition_state]);
      }
    },
  };
})();


onloadModule.register(function() {
  document.getElementById("competition-id-dropdown")
          .addEventListener("change", editChampionshipsModule.setActiveCompetition);
  championships = document.getElementsByClassName("existing-championship-data");
  Array.prototype.forEach.call(championships, function(elt) {
    editChampionshipsModule.addChampionship(elt.dataset.championshipid,
                                            elt.dataset.competitionid);
  });

  states = document.getElementsByClassName("state-data");
  Array.prototype.forEach.call(states, function(elt) {
    editChampionshipsModule.addState(elt.dataset.stateid, elt.dataset.regionid,
                                     elt.dataset.statename);
  });

  regions = document.getElementsByClassName("region-data");
  Array.prototype.forEach.call(regions, function(elt) {
    editChampionshipsModule.addRegion(elt.dataset.regionid, elt.dataset.regionname);
  });

  document.getElementById("regional-pbq-selector")
          .addEventListener("change", editChampionshipsModule.onRegionSelect);
});

