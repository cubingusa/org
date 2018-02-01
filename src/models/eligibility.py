from google.appengine.ext import ndb

from src.models.championship import Championship
from src.models.user import User

class RegionalChampionshipEligibility(ndb.Model):
  user = ndb.KeyProperty(kind=User)
  championship = ndb.KeyProperty(kind=Championship)
  year = ndb.ComputedProperty(lambda self: self.championship.get().year)
  region = ndb.ComputedProperty(lambda self: self.championship.get().region)

  @staticmethod
  def Id(user_id, year):
    return '%s_%d' % (user_id, year)


class StateChampionshipEligibility(ndb.Model):
  user = ndb.KeyProperty(kind=User)
  championship = ndb.KeyProperty(kind=Championship)
  year = ndb.ComputedProperty(lambda self: self.championship.get().year)
  state = ndb.ComputedProperty(lambda self: self.championship.get().state)

  @staticmethod
  def Id(user_id, year):
    return '%s_%d' % (user_id, year)
