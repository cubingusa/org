from google.appengine.ext import ndb

from src.models.region import Region
from src.models.state import State
from src.models.wca.competition import Competition

class Championship(ndb.Model):
  national_championship = ndb.BooleanProperty()
  region = ndb.KeyProperty(kind=Region)
  state = ndb.KeyProperty(kind=State)

  competition = ndb.KeyProperty(kind=Competition)

  year = ndb.ComputedProperty(lambda self: self.competition.get().year)

  @staticmethod
  def NationalsId(year):
    return str(year)

  @staticmethod
  def RegionalsId(year, region):
    return '%s_%d' % (region.key.id(), year)

  @staticmethod
  def StateChampionshipId(year, state):
    return '%s_%d' % (state.key.id(), year)
