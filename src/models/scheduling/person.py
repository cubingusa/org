from google.appengine.ext import ndb

from src.models.scheduling.competition import ScheduleCompetition
from src.models.user import User
from src.models.wca.country import Country
from src.models.wca.event import Event
from src.models.wca.person import Person

class SchedulePersonRoles:
  STAFF = 'STAFF'
  EDITOR = 'EDITOR'

class SchedulePerson(ndb.Model):
  competition = ndb.KeyProperty(kind=ScheduleCompetition)
  # TODO: should we include an ID used by cubecomps / wca-live?
  name = ndb.StringProperty()
  user = ndb.KeyProperty(kind=User)
  wca_person = ndb.KeyProperty(kind=Person)
  country = ndb.KeyProperty(kind=Country)
  email = ndb.StringProperty()
  registered_events = ndb.KeyProperty(kind=Event, repeated=True)
  roles = ndb.StringProperty(repeated=True)

  @staticmethod
  def Id(competition_id, user_id):
    return '%s_%d' % (competition_id, user_id)
