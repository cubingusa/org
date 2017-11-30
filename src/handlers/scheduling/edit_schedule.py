from src import common
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.scheduling.round import ScheduleRound


class EditScheduleHandler(SchedulingBaseHandler):
  def get(self, schedule_version):
    if not self.SetSchedule(int(schedule_version)):
      return
    template = JINJA_ENVIRONMENT.get_template('scheduling/edit_schedule.html')
    event_keys = set([r.event for r in
                     ScheduleRound.query(ScheduleRound.schedule == self.schedule.key).iter()])
    events = [e.get() for e in sorted(event_keys, key=lambda e: e.get().rank)]
    self.response.write(template.render({
        'c': common.Common(self),
        'competition': self.competition,
        'schedule': self.schedule,
        'events': events,
    }))
