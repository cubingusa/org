import datetime
import webapp2

from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.models.scheduling.schedule import Schedule


class NewScheduleHandler(SchedulingBaseHandler):
  def get(self, competition_id):
    if not self.SetCompetition(competition_id):
      return
    schedule = Schedule()
    schedule.competition = self.competition.key
    schedule.creation_time = datetime.datetime.now()
    schedule.last_update_time = schedule.creation_time
    schedule.is_live = False
    schedule.put()
    self.redirect(webapp2.uri_for('edit_schedule', schedule_version=schedule.key.id()))
