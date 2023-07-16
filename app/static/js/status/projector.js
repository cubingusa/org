var lastRefresh = null;

function setEvents(prefix, details, byStage, stages, showTimes) {
  if (details.eventId === undefined) {
    document.getElementById(prefix + '-icon').className = '';
    document.getElementById(prefix + '-text').innerHTML = '';
    if (showTimes) {
      document.getElementById(prefix + '-time').innerHTML = '';
    }
  } else {
    if (showTimes) {
      document.getElementById(prefix + '-time').innerHTML = '<b>' + luxon.DateTime.fromSeconds(details.startTime).toLocaleString(luxon.DateTime.TIME_SIMPLE) + '</b>: ';
    }
    document.getElementById(prefix + '-icon').className = 'cubing-icon event-' + details.eventId;
    document.getElementById(prefix + '-text').innerHTML = ' ' + details.name;
  }
  const container = document.getElementById(prefix + '-container');
  const childIds = Array();
  for (const child of container.children) {
    childIds.push(child.id);
  }
  const usedChildIds = Array();
  for (const [stageId, activity] of Object.entries(byStage)) {
    if ((details.stages || []).includes(+stageId)) {
      continue;
    }
    var elt = null;
    var eltId = prefix + '-' + activity.id;
    usedChildIds.push(eltId);
    if (childIds.includes(eltId)) {
      console.log('already have ' + eltId);
      elt = document.getElementById(eltId);
    } else {
      console.log('adding ' + eltId);
      elt = document.createElement('div');
      elt.className = 'message-line';
      elt.id = eltId;
      container.appendChild(elt);
    }
    var time = showTimes ? luxon.DateTime.fromSeconds(activity.startTime).toLocaleString(luxon.DateTime.TIME_SIMPLE) + ' ' : '';
    elt.innerHTML = '<b>' + time + stages[stageId].name + '</b>: ' + activity.name;
  }
  for (const child of container.children) {
    if (!usedChildIds.includes(child.id)) {
      console.log('destroying ' + child.id);
      child.remove();
    }
  }
}

function load() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      time = luxon.DateTime.now();
      document.getElementById('time').innerHTML = time.toLocaleString(luxon.DateTime.TIME_SIMPLE);
      console.log(xhr.response);
      if (lastRefresh === null) {
        lastRefresh = xhr.response.metadata.refreshTs;
      } else if (lastRefresh !== xhr.response.metadata.refreshTs) {
        location.reload();
      }
      var delay = document.getElementById('delay');
      if (xhr.response.metadata.delayMinutes > 0) {
        delay.innerHTML = 'We\'re running ' + xhr.response.metadata.delayMinutes + ' minutes behind.';
      } else {
        delay.innerHTML = '';
      }
      document.getElementById('message').innerHTML = xhr.response.metadata.message;
      document.getElementById('main-image').src = xhr.response.metadata.imageUrl;

      setEvents('current', xhr.response.currentGroup, xhr.response.currentByStage, xhr.response.stages, false);
      setEvents('next', xhr.response.nextGroup, xhr.response.nextByStage, xhr.response.stages, true);
    }
  }
  var dataset = document.getElementById('data-holder').dataset;
  xhr.responseType = 'json';
  xhr.open('GET', '/status/' + dataset.competitionid + '/payload', true);
  xhr.send();
}

setInterval(load, 15000);
load();
