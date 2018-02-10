import collections
import datetime
import random

from google.appengine.ext import ndb

from src import common
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.stage import ScheduleStage
from src.models.scheduling.time_block import ScheduleTimeBlock
from src.models.wca.event import Event


class EventDetailsHandler(SchedulingBaseHandler):
  def get(self, schedule_version, event_id):
    if not self.SetSchedule(int(schedule_version)):
      return
    event = Event.get_by_id(event_id)
    if not event:
      self.response.set_code(400)
      return
    self.response.write(EventDetailsHandler.GetImpl(self, self.schedule, event))

  @staticmethod
  def GetImpl(handler, schedule, event):
    rounds = ScheduleRound.query(
                 ndb.AND(ScheduleRound.schedule == schedule.key,
                         ScheduleRound.event == event.key)).order(ScheduleRound.number).fetch()
    time_blocks_by_round = collections.defaultdict(list)
    for time_block in (ScheduleTimeBlock
                          .query(ScheduleTimeBlock.schedule == schedule.key)
                          .order(ScheduleTimeBlock.start_time)
                          .iter()):
      time_blocks_by_round[time_block.round].append(time_block)
      
    stages = (ScheduleStage
                  .query(ScheduleStage.schedule == schedule.key)
                  .order(ScheduleStage.number)
                  .fetch())
    competition_days = []
    current_date = schedule.start_date
    while current_date <= schedule.end_date:
      competition_days.append(current_date)
      current_date += datetime.timedelta(days=1)

    template = JINJA_ENVIRONMENT.get_template('scheduling/event_details.html')
    return template.render({
        'c': common.Common(handler),
        'rounds': rounds,
        'event': event,
        'time_blocks': time_blocks_by_round,
        'new_ids': {r.key : '%s_%d' % (r.key.id(), random.randint(2 ** 4, 2 ** 32))
                    for r in rounds},
        'stages': stages,
        'competition_days': competition_days,
    })
