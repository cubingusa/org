from src import common
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.jinja import JINJA_ENVIRONMENT


class EditScheduleHandler(SchedulingBaseHandler):
  def get(self, schedule_version):
    if not self.SetSchedule(int(schedule_version)):
      return
    template = JINJA_ENVIRONMENT.get_template('scheduling/edit_schedule.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'competition': self.competition,
        'schedule': self.schedule,
    }))
