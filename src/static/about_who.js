onloadModule.register(function() {
  var elt = null;
  if (window.location.hash != "") {
    elt = document.getElementById(window.location.hash.substring(1) + "_link");
  }
  if (elt == null) {
    elt = document.querySelector("div.card a");
    if (elt == null) {
      return;
    }
  }
  elt.click();
});
