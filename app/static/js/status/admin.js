var lastRefresh = null;
var selectedRole = null;
var notifiedGroups = Array();

if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

function chipClasses(expected, actual) {
  expected = luxon.DateTime.fromSeconds(expected);
  actual = luxon.DateTime.fromSeconds(actual);
  var delta = actual.diff(expected, 'minutes').minutes;
  if (delta < -2) {
    return 'badge badge-success';
  }
  if (delta < 2) {
    return 'badge badge-warning';
  }
  return 'badge badge-danger';
}

function chipTime(expected, actual) {
  expected = luxon.DateTime.fromSeconds(expected);
  actual = luxon.DateTime.fromSeconds(actual);
  var delta = Math.floor(actual.diff(expected, 'seconds').seconds);
  if (delta > 0) {
    return `+${Math.floor(delta / 60)}:${(delta % 60).toString().padStart(2, '0')}`;
  } else {
    delta = Math.abs(delta);
    return `-${Math.floor(delta / 60)}:${(delta % 60).toString().padStart(2, '0')}`;
  }
}

function updateTimestamps() {
  for (const elt of document.getElementsByClassName('live-chip')) {
    var ts = +elt.dataset.ts;
    elt.className = "live-chip " + chipClasses(ts, Date.now() / 1000);
    elt.innerHTML = chipTime(ts, Date.now() / 1000);
  }
}

function readyGroup(activityId) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      load();
    }
  }
  var dataset = document.getElementById('data-holder').dataset;
  xhr.open('POST', `/status/${dataset.competitionid}/ready/${activityId}`, true);
  xhr.send();
}

function callGroups(activityIds) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      load();
    }
  }
  var dataset = document.getElementById('data-holder').dataset;
  xhr.open('POST', `/status/${dataset.competitionid}/call/${activityIds.join(',')}`, true);
  xhr.send();
}

function setEvents(prefix, details, stages, showButton) {
  if (details.eventId === undefined) {
    document.getElementById(prefix).style.display = 'none';
    return;
  }
  document.getElementById(prefix).style.display = null;
  const container = document.getElementById(prefix + '-container');
  document.getElementById(prefix + '-name').innerHTML = details.name + ' ' + luxon.DateTime.fromSeconds(details.startTime).toLocaleString(luxon.DateTime.TIME_SIMPLE);
  const childIds = Array();
  for (const child of container.children) {
    childIds.push(child.id);
  }
  const usedChildIds = Array();
  const activityIds = Array();
  for (const detail of details.callDetails) {
    activityIds.push(detail.activityId);
    const stage = stages[detail.stageId];
    var elt = null;
    var eltId = prefix + '-' + detail.stageId;
    usedChildIds.push(eltId);
    if (childIds.includes(eltId)) {
      elt = document.getElementById(eltId);
    } else {
      elt = document.createElement('div');
      elt.className = 'list-group-item';
      elt.id = eltId;
      container.appendChild(elt);
    }
    if (detail.stageId === +selectedRole && showButton && !detail.readyAt) {
      elt.classList.add('list-group-item-action');
      elt.classList.add('active');
      elt.onclick = () => readyGroup(detail.activityId);
    } else {
      elt.classList.remove('list-group-item-action');
      elt.classList.remove('active');
      elt.onclick = null;
    }
    elt.innerHTML = `<span class="stage-chip" style="border-color: ${stage.color}">${stage.name}</span> `;
    if (detail.readyAt) {
      elt.innerHTML += `${detail.readyBy} <div class="${chipClasses(details.startTime, detail.readyAt)}">${chipTime(details.startTime, detail.readyAt)}</div> ✔️`
    } else {
      elt.innerHTML += `<div class="live-chip ${chipClasses(details.startTime, Date.now() / 1000)}" data-ts=${details.startTime}>${chipTime(details.startTime, Date.now() / 1000)}</div>`
    }
  }
  for (const child of container.children) {
    if (!usedChildIds.includes(child.id)) {
      child.remove();
    }
  }
  var detail = details.callDetails[0];
  var elt = document.getElementById(prefix + '-called');
  if (detail.calledAt) {
    elt.innerHTML = `Called by ${detail.calledBy} <div class="${chipClasses(details.startTime, detail.calledAt)}">${chipTime(details.startTime, detail.calledAt)}</div>`
  } else {
    elt.innerHTML = `Not called yet <div class="live-chip ${chipClasses(details.startTime, Date.now() / 1000)}" data-ts=${details.startTime}>${chipTime(details.startTime, Date.now() / 1000)}</div>`
  }
  if (selectedRole === 'announcer') {
    elt.classList.add('list-group-item-action');
    elt.classList.add('active');
    elt.onclick = () => callGroups(activityIds);
    document.getElementById('form').style.display = null;
  } else {
    elt.classList.remove('list-group-item-action');
    elt.classList.remove('active');
    elt.onclick = null;
    document.getElementById('form').style.display = 'none';
  }
}

function load() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      time = luxon.DateTime.now() / 1000;
      if (lastRefresh === null) {
        lastRefresh = xhr.response.metadata.refreshTs;
      } else if (lastRefresh !== xhr.response.metadata.refreshTs) {
        location.reload();
      }

      setEvents('current', xhr.response.currentGroup, xhr.response.stages, false);
      setEvents('next', xhr.response.nextGroup, xhr.response.stages, true);

      if (!xhr.response.nextGroup.id) {
        return;
      }
      var timeTillNextGroup = luxon.DateTime.now().diff(luxon.DateTime.fromSeconds(xhr.response.nextGroup.startTime), 'minutes').minutes;

      if (xhr.response.nextGroup.stages.includes(+selectedRole) &&
          timeTillNextGroup < 5 &&
          !notifiedGroups.includes(xhr.response.nextGroup.id) &&
          xhr.response.nextGroup.callDetails.some((call) => call.stageId === +selectedRole && call.readyAt === undefined)) {
        new Notification("Less than five minutes until " + xhr.response.nextGroup.name);
        notifiedGroups.push(xhr.response.nextGroup.id);
      }

      if (selectedRole === 'announcer' &&
          !notifiedGroups.includes(xhr.response.nextGroup.id) &&
        !xhr.response.nextGroup.callDetails.some((call) => call.readyAt === undefined)) {
        new Notification("All stages ready for " + xhr.response.nextGroup.name);
        notifiedGroups.push(xhr.response.nextGroup.id);
      }
    }
  }
  var dataset = document.getElementById('data-holder').dataset;
  xhr.responseType = 'json';
  xhr.open('GET', '/status/' + dataset.competitionid + '/payload', true);
  xhr.send();
}

document.getElementById('stage-selector').onchange = () => {
  selectedRole = document.getElementById('stage-selector').value;
  load();
}

setInterval(load, 15000);
setInterval(updateTimestamps, 1000);
load();
