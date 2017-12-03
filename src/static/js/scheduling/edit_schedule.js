var editScheduleModule = (function() {
  var scheduleId = document.getElementById('schedule-id').dataset.schedule;

  var startDateElement = document.getElementById('start-date');
  var endDateElement = document.getElementById('end-date');

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
      req.send();
    },

    selectEvent: function(event_id, event_name) {
      document.getElementById('event-info').innerHTML = event_name;
    },

    addStage: function(e) {
      e.preventDefault();
      var formElt = e.target;
      var formData = new FormData(formElt);
      var req = new XMLHttpRequest();
      req.open('POST', '/scheduling/async/add_stage/' + scheduleId);
      req.addEventListener('load', function() {
        var prnt = formElt.parentNode;
        prnt.innerHTML = req.responseText;
        editScheduleModule.addListeners();
      });
      req.send(formData);
      return false;
    },

    expandEdit: function(e) {
      var clickedElement = e.target;
      var rowToExpand = document.getElementById('edit-row-' + clickedElement.dataset.stageid);
      rowToExpand.classList.remove('d-none');
      var rowToHide = document.getElementById('stage-row-' + clickedElement.dataset.stageid);
      rowToHide.classList.add('d-none');
    },

    addListeners: function() {
      Array.prototype.forEach.call(document.getElementsByClassName('stage-form'), function(elt) {
        elt.addEventListener('submit', editScheduleModule.addStage);
      });
      Array.prototype.forEach.call(document.getElementsByClassName('edit-link'), function(elt) {
        elt.addEventListener('click', editScheduleModule.expandEdit);
      });
    },
  };
})();

eventSelectorModule.setSelectListener(editScheduleModule.selectEvent);

onloadModule.register(function() {
  $('#start-date').datetimepicker({
    format: 'YYYY-MM-DD',
  });
  $('#end-date').datetimepicker({
    useCurrent: false,
    format: 'YYYY-MM-DD',
  });
  $('#start-date').on('dp.change', function (e) {
    $('#end-date').data('DateTimePicker').minDate(e.date);
    editScheduleModule.reportDates();
  });
  $('#end-date').on('dp.change', function (e) {
    $('#start-date').data('DateTimePicker').maxDate(e.date);
    editScheduleModule.reportDates();
  });
  editScheduleModule.addListeners();
});
