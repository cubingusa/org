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
    rounds = ScheduleRound.query(
                 ndb.AND(ScheduleRound.schedule == self.schedule.key,
                         ScheduleRound.event == event.key)).order(ScheduleRound.number).fetch()
    time_blocks_by_round = collections.defaultdict(list)
    for time_block in (ScheduleTimeBlock
                          .query(ScheduleTimeBlock.schedule == self.schedule.key)
                          .order(ScheduleTimeBlock.start_time)
                          .iter()):
      time_blocks_by_round[time_block.round].append(time_block)
    # Immediately after adding a TimeBlock, it may not have propagated to the datastore.
    # So we force retrieval of the just-added TimeBlock.
    if 'include_time_block' in self.request.GET:
      time_block = ScheduleTimeBlock.get_by_id(self.request.GET['include_time_block'])
      found = False
      for old_time_block in time_blocks_by_round[time_block.round]:
        if old_time_block.key == time_block.key:
          found = True
      if not found:
        time_blocks_by_round[time_block.round].append(time_block)
        time_blocks_by_round[time_block.round].sort(key=lambda tb: tb.GetStartTime())
      
    stages = (ScheduleStage
                  .query(ScheduleStage.schedule == self.schedule.key)
                  .order(ScheduleStage.number)
                  .fetch())
    competition_days = []
    current_date = self.schedule.start_date
    while current_date <= self.schedule.end_date:
      competition_days.append(current_date)
      current_date += datetime.timedelta(days=1)

    template = JINJA_ENVIRONMENT.get_template('scheduling/event_details.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'rounds': rounds,
        'event': event,
        'time_blocks': time_blocks_by_round,
        'new_ids': {r.key : '%s_%d' % (r.key.id(), random.randint(2 ** 4, 2 ** 32))
                    for r in rounds},
        'stages': stages,
        'competition_days': competition_days,
    }))
