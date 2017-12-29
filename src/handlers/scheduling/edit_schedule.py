import random

from src import common
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.schedule import Schedule
from src.models.scheduling.stage import ScheduleStage
from src.scheduling.colors import Colors


class EditScheduleHandler(SchedulingBaseHandler):
  def get(self, schedule_version):
    if not self.SetSchedule(int(schedule_version)):
      return
    template = JINJA_ENVIRONMENT.get_template('scheduling/edit_schedule.html')
    event_keys = set([r.event for r in
                     ScheduleRound.query(ScheduleRound.schedule == self.schedule.key).iter()])
    events = [e.get() for e in sorted(event_keys, key=lambda e: e.get().rank)]
    stages = (ScheduleStage
                  .query(ScheduleRound.schedule == self.schedule.key)
                  .order(ScheduleRound.number)
                  .fetch())
    schedule_versions = Schedule.query(Schedule.competition == self.competition.key).fetch()
    self.response.write(template.render({
        'c': common.Common(self),
        'competition': self.competition,
        'schedule': self.schedule,
        'events': events,
        'stages': stages,
        'new_stage_id': random.randint(2 ** 4, 2 ** 10),
        'colors': sorted(Colors.keys()),
        'schedule_versions': schedule_versions,
    }))
