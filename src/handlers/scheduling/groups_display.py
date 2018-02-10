import collections

from google.appengine.ext import ndb

from src import common
from src import timezones
from src.scheduling.competition_details import CompetitionDetails
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.models.scheduling.group import ScheduleGroup
from src.models.scheduling.stage import ScheduleStage
from src.jinja import JINJA_ENVIRONMENT


class GroupsDisplayHandler(SchedulingBaseHandler):
  def get(self, competition_id, schedule_version=-1):
    if not self.SetSchedule(int(schedule_version)):
      return
    template = JINJA_ENVIRONMENT.get_template('scheduling/groups_display.html')
    groups_by_day_and_stage = collections.defaultdict(lambda: collections.defaultdict(list))
    all_days = set()
    for group in ScheduleGroup.query(ScheduleGroup.schedule == self.schedule.key).iter():
      groups_by_day_and_stage[group.start_time.date()][group.stage].append(group)
      all_days.add(group.start_time.date())
    for groups_set in groups_by_day_and_stage.itervalues():
      for groups in groups_set.itervalues():
        groups.sort(key=lambda g: g.start_time)
    all_days = sorted(all_days)
    all_stages = (ScheduleStage.query(ScheduleStage.schedule == self.schedule.key)
                               .order(ScheduleStage.number)
                               .fetch())
    self.response.write(template.render({
        'c': common.Common(self),
        'timezones': timezones,
        'competition': self.competition,
        'groups_by_day_and_stage': groups_by_day_and_stage,
        'all_stages': all_stages,
        'all_days': all_days,
    }))
