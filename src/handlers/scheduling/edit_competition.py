import datetime
import pytz
import webapp2

from src import common
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.scheduling.schedule import Schedule


class EditCompetitionHandler(SchedulingBaseHandler):
  def get(self, competition_id):
    if not self.SetCompetition(competition_id):
      return
    timezones_and_times = [
        (timezone, datetime.datetime.now(pytz.timezone(timezone)).strftime('%I:%M %p'))
        for timezone in pytz.country_timezones('us')]
    schedule_versions = Schedule.query(Schedule.competition == self.competition.key).fetch()
    template = JINJA_ENVIRONMENT.get_template('scheduling/edit_competition.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'competition': self.competition,
        'timezones_and_times': timezones_and_times,
        'schedule_versions': schedule_versions,
    }))

  def post(self, competition_id):
    if not self.SetCompetition(competition_id):
      return
    self.competition.timezone = self.request.POST['timezone']
    self.competition.put()
    self.get(competition_id)
