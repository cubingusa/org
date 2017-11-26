import datetime
import pytz
import webapp2

from src import common
from src.handlers.base import BaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.scheduling.competition import ScheduleCompetition
from src.models.scheduling.version import ScheduleVersion


class EditCompetitionHandler(BaseHandler):
  def get(self, competition_id):
    competition = self.GetCompetitionOrRespondWithError(competition_id)
    if not competition:
      return
    timezones_and_times = [
        (timezone, datetime.datetime.now(pytz.timezone(timezone)).strftime('%I:%M %p'))
        for timezone in pytz.country_timezones('us')]
    schedule_versions = ScheduleVersion.query(
                            ScheduleVersion.competition == competition.key).fetch()
    template = JINJA_ENVIRONMENT.get_template('scheduling/edit_competition.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'competition': competition,
        'timezones_and_times': timezones_and_times,
        'schedule_versions': schedule_versions,
    }))

  def post(self, competition_id):
    competition = self.GetCompetitionOrRespondWithError(competition_id)
    if not competition:
      return
    competition.timezone = self.request.POST['timezone']
    competition.put()
    self.get(competition_id)

  def GetCompetitionOrRespondWithError(self, competition_id):
    competition = ScheduleCompetition.get_by_id(competition_id)
    if not competition:
      self.response.write(JINJA_ENVIRONMENT.get_template('error.html').render({
          'c': common.Common(self),
          'error': 'Unknown competition %s.  Make sure that scheduling is '
                   'enabled for this competition.' % competition_id,
      }))
      return None
    if self.user.key not in competition.editors:
      self.response.write(JINJA_ENVIRONMENT.get_template('error.html').render({
          'c': common.Common(self),
          'error': 'You don\'t have edit access to this competition.',
      }))
      return None
    return competition
