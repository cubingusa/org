var editScheduleModule = (function() {
  var scheduleId = document.getElementById('schedule-id').dataset.schedule;

  var startDateElement = document.getElementById('start-date');
  var endDateElement = document.getElementById('end-date');

  return {
    reportDates: function() {
      var req = new XMLHttpRequest();
      
      req.open('POST',
               '/scheduling/async/set_schedule_dates/' + scheduleId +
               '/' + startDateElement.value +
               '/' + endDateElement.value);
      req.send();
    },
  };
})();

onloadModule.register(function() {
  $('.input-daterange').datepicker({
    orientation: 'bottom',
    format: 'yyyy-mm-dd',
  });

  document.getElementById('start-date').onchange=editScheduleModule.reportDates;
  document.getElementById('end-date').onchange=editScheduleModule.reportDates;
});
