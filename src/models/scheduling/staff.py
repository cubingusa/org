from google.appengine.ext import ndb

from src.models.user import User
from src.models.scheduling.competition import ScheduleCompetition

class StaffRoles:
  STAFF = 'STAFF'
  EDITOR = 'EDITOR'

class ScheduleStaff(ndb.Model):
  competition = ndb.KeyProperty(kind=ScheduleCompetition)
  user = ndb.KeyProperty(kind=User)
  roles = ndb.StringProperty(repeated=True)

  job_list = ndb.StringProperty(repeated=True)
  preferences = ndb.IntegerProperty(repeated=True)

  unavailable_starts = ndb.DateTimeProperty()
  unavailable_ends = ndb.DateTimeProperty()

  attendance_probability = ndb.IntegerProperty()
  created = ndb.DateTimeProperty()
  last_update = ndb.DateTimeProperty()
  canceled = ndb.DateTimeProperty()

  @staticmethod
  def Id(competition_id, user_id):
    return '%s_%s' % (competition_id, user_id)

  def GetJobPreference(self, job_name):
    for i in range(len(self.job_list)):
      if self.job_list[i] == job_name:
        return self.preferences[i]
    return 0
