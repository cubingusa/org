var editScheduleModule = (function() {
  var scheduleId = document.getElementById('schedule-id').dataset.schedule;
  var eventId = '';
  var event_name = '';

  var startDateElement = document.getElementById('start-date');
  var endDateElement = document.getElementById('end-date');

  var fontAwesomeIcons = {
    time: 'fa fa-clock-o',
    date: 'fa fa-calendar',
    up: 'fa fa-chevron-up',
    down: 'fa fa-chevron-down',
    previous: 'fa fa-chevron-left',
    next: 'fa fa-chevron-right',
    today: 'fa fa-calendar-o',
    clear: 'fa fa-trash',
    close: 'fa fa-remove',
  };

  var asyncFormSubmit = function(e, uri, callback) {
    e.preventDefault();
    var formElt = e.target;
    var formData = new FormData(formElt);
    var req = new XMLHttpRequest();
    req.open('POST', uri);
    req.addEventListener('load', function() {
      callback(formElt, req);
    });
    req.send(formData);
    return false;
  }

  var addTimeRanges = function() {
    Array.prototype.forEach.call(document.getElementsByClassName('input-timerange'), function(elt) {
      startTime = $('#start-time-' + elt.dataset.timeblock);
      endTime = $('#end-time-' + elt.dataset.timeblock);
      startTime.datetimepicker({
        useCurrent: false,
        format: 'h:mm A',
        icons: fontAwesomeIcons,
      });
      endTime.datetimepicker({
        useCurrent: false,
        format: 'h:mm A',
        icons: fontAwesomeIcons,
      });
      startTime.on('dp.change', function(e) {
        endTime.data('DateTimePicker').defaultDate(e.date);
      });
      endTime.on('dp.change', function(e) {
        startTime.data('DateTimePicker').defaultDate(e.date);
      });
    });
  };

  return {
    reportDates: function() {
      if (startDateElement.value === '' || endDateElement.value === '') {
        return;
      }
      var req = new XMLHttpRequest();
      
      req.open('POST',
               '/scheduling/async/set_schedule_dates/' + scheduleId +
               '/' + startDateElement.value +
               '/' + endDateElement.value);
      req.addEventListener('load', function() {
        location.reload();
      });
      req.send();
    },

    selectEvent: function(event_id, event_name) {
      eventId = event_id;
      eventName = event_name;
      var req = new XMLHttpRequest();
      req.open('GET', '/scheduling/async/get_event_details/' + scheduleId + '/' + eventId);
      req.addEventListener('load', function() {
        document.getElementById('event-info').innerHTML = req.responseText;
        addTimeRanges();
        editScheduleModule.addListeners();
        document.getElementById('event-title').innerHTML = ' - ' + event_name;
      });
      req.send();
    },

    addStage: function(e) {
      return asyncFormSubmit(e, '/scheduling/async/add_stage/' + scheduleId,
                             function(formElt, req) {
        var prnt = formElt.parentNode;
        prnt.innerHTML = req.responseText;
        editScheduleModule.addListeners();
        if (eventId !== null) {
          editScheduleModule.selectEvent(eventId, eventName);
        }
      });
    },

    addTimeBlock: function(e) {
      return asyncFormSubmit(e, '/scheduling/async/add_time_block/' + scheduleId,
                             function(formElt, req) {
        var prnt = formElt.parentNode.parentNode;
        prnt.innerHTML = req.responseText;
        editScheduleModule.addListeners();
        addTimeRanges();
      });
    },

    expandEdit: function(e) {
      var clickedElement = e.target;
      var rowToExpand = document.getElementById('edit-row-' + clickedElement.dataset.editid);
      rowToExpand.classList.remove('d-none');
      var rowToHide = document.getElementById('editable-row-' + clickedElement.dataset.editid);
      rowToHide.classList.add('d-none');
    },

    selectColor: function(stageId) {
      return function() {
        selected = this.options[this.selectedIndex].dataset.color;
        stageChip = document.getElementById('stage-chip-' + stageId);
        stageChip.classList.remove('background-' + stageChip.dataset.color);
        stageChip.classList.add('background-' + selected);
        stageChip.dataset.color = selected;
      };
    },

    createDatePickers: function() {
      $('#start-date').datetimepicker({
        format: 'YYYY-MM-DD',
        icons: fontAwesomeIcons,
      });
      $('#end-date').datetimepicker({
        useCurrent: false,
        format: 'YYYY-MM-DD',
        icons: fontAwesomeIcons,
      });
      $('#start-date').on('dp.change', function (e) {
        $('#end-date').data('DateTimePicker').minDate(e.date);
        editScheduleModule.reportDates();
      });
      $('#end-date').on('dp.change', function (e) {
        $('#start-date').data('DateTimePicker').maxDate(e.date);
        editScheduleModule.reportDates();
      });
    },

    addListeners: function() {
      Array.prototype.forEach.call(document.getElementsByClassName('color-selector'), function(elt) {
        elt.onchange = editScheduleModule.selectColor(elt.dataset.chipid);
      });
      Array.prototype.forEach.call(document.getElementsByClassName('stage-form'), function(elt) {
        elt.onsubmit = editScheduleModule.addStage;
      });
      Array.prototype.forEach.call(document.getElementsByClassName('time-block-form'), function(elt) {
        elt.onsubmit = editScheduleModule.addTimeBlock;
      });
      Array.prototype.forEach.call(document.getElementsByClassName('edit-link'), function(elt) {
        elt.onclick = editScheduleModule.expandEdit;
      });
    },
  };
})();

eventSelectorModule.setSelectListener(editScheduleModule.selectEvent);

onloadModule.register(function() {
  editScheduleModule.createDatePickers();
  editScheduleModule.addListeners();
});
