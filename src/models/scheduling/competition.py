from google.appengine.ext import ndb

from src.models.user import User
from src.models.wca.competition import Competition

class ScheduleCompetition(ndb.Model):
  wca_competition = ndb.KeyProperty(kind=Competition)
  editors = ndb.KeyProperty(kind=User, repeated=True)
  timezone = ndb.StringProperty()
  name = ndb.StringProperty()
