onloadModule.register(function() {
  var competitors = document.getElementById('competitor-select');
  competitors.onchange = function() {
    var selected = competitors.options[competitors.selectedIndex];
    if (selected.dataset['wcaid']) {
      window.location = '/nationals/2019/groups/' + selected.dataset['wcaid'];
    }
  };
});
