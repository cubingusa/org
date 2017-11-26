import datetime
import webapp2

from google.appengine.ext import ndb

from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.models.scheduling.schedule import Schedule


class SetLiveHandler(SchedulingBaseHandler):
  def get(self, schedule_version, set_live):
    if not self.SetSchedule(int(schedule_version)):
      return
    self.schedule.is_live = (set_live == '1')
    self.schedule.last_update = datetime.datetime.now()
    if self.schedule.is_live:
      for schedule in Schedule.query(ndb.AND(Schedule.competition == self.competition.key,
                                             Schedule.is_live == True)).iter():
        schedule.is_live = False
        schedule.put()
    self.schedule.put()
    self.redirect(webapp2.uri_for('edit_schedule', schedule_version=self.schedule.key.id()))
