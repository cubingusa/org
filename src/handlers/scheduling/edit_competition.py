import datetime
import pytz
import webapp2

from google.appengine.ext import ndb

from src import common
from src import timezones
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.schedule import Schedule
from src.models.scheduling.staff import ScheduleStaff
from src.models.scheduling.staff import StaffRoles


class EditCompetitionHandler(SchedulingBaseHandler):
  def get(self, competition_id):
    if not self.SetCompetition(competition_id):
      return
    timezones_and_times = [
        (timezone, datetime.datetime.now(pytz.timezone(timezone)).strftime('%I:%M %p'))
        for timezone in pytz.country_timezones('us')]
    schedule_versions = Schedule.query(Schedule.competition == self.competition.key).fetch()

    # We look at the live schedule, or the most-recently updated one, and make
    # sure that it has events and start/end dates.
    schedule_for_staff_signup = None
    if schedule_versions:
      for schedule in schedule_versions:
        if schedule.is_live:
          schedule_for_staff_signup = schedule
      if not schedule_for_staff_signup:
        schedule_for_staff_signup = sorted(schedule_versions, 
                                           key=lambda s: s.last_update_time)[-1]
      has_rounds = (ScheduleRound.query(ScheduleRound.schedule == schedule_for_staff_signup.key)
                                 .iter().has_next())
    template = JINJA_ENVIRONMENT.get_template('scheduling/edit_competition.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'competition': self.competition,
        'editors': ScheduleStaff.query(ndb.AND(ScheduleStaff.competition == self.competition.key,
                                               ScheduleStaff.roles == StaffRoles.EDITOR)).fetch(),
        'timezones_and_times': timezones_and_times,
        'schedule_versions': schedule_versions,
        'staff_signup_enabled': schedule_for_staff_signup and
                                schedule_for_staff_signup.start_date and
                                has_rounds,
    }))

  def post(self, competition_id):
    if not self.SetCompetition(competition_id):
      return
    self.competition.timezone = self.request.POST['timezone']
    self.competition.staff_signup_deadline = timezones.ToUTCTime(
        self.request.POST['signup-deadline'] + ' 23:59:59',
        '%Y-%m-%d %H:%M:%S', self.competition.timezone)
    self.competition.put()
    self.get(competition_id)
