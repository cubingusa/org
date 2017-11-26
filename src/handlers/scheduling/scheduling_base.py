from src.handlers.base import BaseHandler

from src import common
from src.jinja import JINJA_ENVIRONMENT
from src.models.scheduling.competition import ScheduleCompetition
from src.models.scheduling.schedule import Schedule

class SchedulingBaseHandler(BaseHandler):
  def RespondWithError(self, error_string):
    template = JINJA_ENVIRONMENT.get_template('error.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'error': error_string,
    }))
    self.response.status = 500

  def SetCompetition(self, competition_id):
    self.competition = ScheduleCompetition.get_by_id(competition_id)
    if not self.competition:
      self.RespondWithError(
          'Unknown competition %s.  Scheduling may not be enabled for this '
          'competition.' % competition_id)
      return False
    if not self.user or self.user.key not in self.competition.editors:
      self.RespondWithError(
          'You don\'t have access to edit this schedule.')
      return False
    return True

  def SetSchedule(self, schedule_version):
    self.schedule = Schedule.get_by_id(schedule_version)
    if not self.schedule:
      self.RespondWithError(
          'Unknown schedule version %s' % schedule_version)
      return False
    return self.SetCompetition(self.schedule.competition.id())
