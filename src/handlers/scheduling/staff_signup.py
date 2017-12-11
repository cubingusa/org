import datetime

from google.appengine.ext import ndb

from src import common
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.schedule import Schedule
from src.models.scheduling.staff import ScheduleStaff
from src.models.scheduling.staff import StaffRoles


class StaffSignupHandler(SchedulingBaseHandler):
  def get(self, competition_id, successful=0):
    if not self.SetCompetition(competition_id, edit_access_needed=False):
      return

    if not self.user:
      self.redirect('/login')
      return

    # Grab a schedule so that we can look up the events and dates.
    # We prefer the live schedule, if not then the most recently-created one.
    schedule = Schedule.query(ndb.AND(Schedule.competition == self.competition.key,
                                      Schedule.is_live == True)).get()
    if not schedule:
      schedule = (Schedule.query(Schedule.competition == self.competition.key)
                          .order(-Schedule.last_update_time)
                          .get())
    if not schedule or not schedule.start_date or not schedule.end_date:
      self.RespondWithError('Staff signup not yet enabled for this competition because the start and end dates aren\'t set.')
      return

    staff_id = ScheduleStaff.Id(competition_id, self.user.key.id())
    staff = ScheduleStaff.get_by_id(staff_id) or ScheduleStaff(id=staff_id)
    preference_choices = [
        (5, 'I enjoy it'),
        (4, 'I like it'),
        (3, 'I don\'t mind it'),
        (2, 'I can tolerate it'),
        (1, 'I hate it'),
        (0, 'I can\'t do it'),
    ]
    event_set = set([r.event for r in ScheduleRound.query(
                                          ScheduleRound.schedule == schedule.key).iter()])
    events = sorted([e_key.get() for e_key in event_set], key=lambda e: e.rank)
    if not events:
      self.RespondWithError('Staff signup not yet enabled for this competition because no events have been imported.')
      return

    template = JINJA_ENVIRONMENT.get_template('scheduling/staff_signup.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'staff': staff,
        'competition': self.competition,
        'schedule': schedule,
        'events': events,
        'preference_choices': preference_choices,
        'deadline_passed': self.competition.staff_signup_deadline < datetime.datetime.now(),
        'readonly': self.competition.staff_signup_deadline < datetime.datetime.now(),
        'successful': successful,
    }))

  def post(self, competition_id):
    if not self.SetCompetition(competition_id, edit_access_needed=False):
      return

    if not self.user:
      self.redirect('/login')
      return

    if self.competition.staff_signup_deadline < datetime.datetime.now():
      self.get(competition_id)
      return
    
    staff_id = ScheduleStaff.Id(competition_id, self.user.key.id())
    staff = ScheduleStaff.get_by_id(staff_id) or ScheduleStaff(id=staff_id)

    staff.attendance_probability = int(self.request.POST['attendance_probability'])
    if not staff.created:
      staff.created = datetime.datetime.now()
    staff.last_updated = datetime.datetime.now()
    staff.job_list = []
    staff.preferences = []
    for key, val in self.request.POST.iteritems():
      if key.startswith('pref_'):
        staff.job_list.append(key[5:])
        staff.preferences.append(int(val))
    if 'cancel' in self.request.POST or staff.attendance_probability == 0:
      staff.attendance_probability = 0
      staff.canceled = datetime.datetime.now()
    staff.put()
    self.get(competition_id, successful=1)
