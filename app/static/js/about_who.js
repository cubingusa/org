onloadModule.register(function() {
  hashModule.expectOneKey('p');

  elts = document.getElementsByClassName('personLink');
  for (var i = 0; i < elts.length; i++) {
    elts[i].onclick = function() { hashModule.setValue('p', this.dataset.name); };
  }

  var elt = null;
  hash = hashModule.getValue('p');
  if (hash != '') {
    elt = document.getElementById(hash + '_link');
  }
  if (elt == null) {
    elt = document.querySelector("div.card a");
    if (elt == null) {
      return;
    }
  }
  elt.click();
});
