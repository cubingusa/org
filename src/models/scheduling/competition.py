from google.appengine.ext import ndb

from src.models.wca.competition import Competition

class ScheduleCompetition(ndb.Model):
  wca_competition = ndb.KeyProperty(kind=Competition)
  timezone = ndb.StringProperty()
  name = ndb.StringProperty()
