from google.appengine.ext import ndb

from src.models.region import Region
from src.models.state import State
from src.models.user import User


class RegionalChampionshipEligibility(ndb.Model):
  user = ndb.KeyProperty(kind=User)
  year = ndb.IntegerProperty()
  region = ndb.KeyProperty(kind=Region)

  @staticmethod
  def Id(user_id, year):
    return '%s_%d' % (user_id, year)


class StateChampionshipEligibility(ndb.Model):
  user = ndb.KeyProperty(kind=User)
  year = ndb.IntegerProperty()
  state = ndb.KeyProperty(kind=State)

  @staticmethod
  def Id(user_id, year):
    return '%s_%d' % (user_id, year)
