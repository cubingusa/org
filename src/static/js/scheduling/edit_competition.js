onloadModule.register(function() {
  $('#signup-deadline').datetimepicker({
    format: 'YYYY-MM-DD',
    icons: {
      time: 'fa fa-clock-o',
      date: 'fa fa-calendar',
      up: 'fa fa-chevron-up',
      down: 'fa fa-chevron-down',
      previous: 'fa fa-chevron-left',
      next: 'fa fa-chevron-right',
      today: 'fa fa-calendar-o',
      clear: 'fa fa-trash',
      close: 'fa fa-remove',
    },
  });
});
