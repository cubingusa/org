from src import common
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.scheduling.round import ScheduleRound
from src.models.wca.event import Event


class EventDetailsHandler(SchedulingBaseHandler):
  def get(self, schedule_version, event_id):
    if not self.SetSchedule(int(schedule_version)):
      return
    event = Event.get_by_id(event_id)
    if not event:
      self.response.set_code(400)
      return
    rounds = ScheduleRound.query(
                 ndb.AND(ScheduleRound.schedule == self.schedule.key,
                         ScheduleRound.event == event.key)).order(ScheduleRound.number).fetch()
    template = JINJA_ENVIRONMENT.get_template('scheduling/event_details.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'rounds': rounds,
        'event': event,
    }))
