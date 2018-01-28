var editChampionshipsModule = (function() {
  var state_names = {};
  var state_regions = {};
  var region_names = {};
  var existing_championships = {};

  var updateChampionshipLink = function(competition_id, championship_type,
                                        championship_id, championship_name) {
    row = document.getElementById(championship_type + "-row");
    linkElt = row.getElementsByClassName("new-championship-link")[0];
    linkElt.href = "/admin/add_championship/" + competition_id + "/" + championship_type;
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
      competition_region = state_regions[competition_state];
      competition_year = selectedElement.dataset.year;
      
      updateChampionshipLink(competition_id, "national",
                             competition_year, "National");
      updateChampionshipLink(competition_id, "regional",
                             competition_region + "_" + competition_year,
                             region_names[competition_region]);
      updateChampionshipLink(competition_id, "state",
                             competition_state + "_" + competition_year,
                             state_names[competition_state]);
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
});

