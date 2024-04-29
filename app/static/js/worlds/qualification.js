Array.from(document.getElementsByClassName('ts')).forEach((elt) => {
  d = luxon.DateTime.fromSeconds(+elt.dataset.ts);
  elt.innerHTML = d.toLocaleString(luxon.DateTime.DATE_FULL) + elt.dataset.divider + d.toLocaleString(luxon.DateTime.TIME_WITH_SHORT_OFFSET);
})
