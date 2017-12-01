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
  $("#start-date").on("dp.change", function (e) {
    $('#end-date').data("DateTimePicker").minDate(e.date);
    editScheduleModule.reportDates();
  });
  $("#end-date").on("dp.change", function (e) {
    $('#start-date').data("DateTimePicker").maxDate(e.date);
    editScheduleModule.reportDates();
  });
});
