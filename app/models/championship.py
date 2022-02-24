from google.cloud import ndb

from app.models.region import Region
from app.models.state import State
from app.models.wca.competition import Competition

class Championship(ndb.Model):
  national_championship = ndb.BooleanProperty()
  region = ndb.KeyProperty(kind=Region)
  state = ndb.KeyProperty(kind=State)

  competition = ndb.KeyProperty(kind=Competition)

  year = ndb.ComputedProperty(lambda self: self.competition.get().year)

  residency_deadline = ndb.DateTimeProperty()
  residency_timezone = ndb.StringProperty()

  @staticmethod
  def NationalsId(year):
    return str(year)

  @staticmethod
  def RegionalsId(year, region):
    return '%s_%d' % (region.key.id(), year)

  @staticmethod
  def StateChampionshipId(year, state):
    return '%s_%d' % (state.key.id(), year)

  def GetEligibleStateKeys(self):
    if self.state:
      return [self.state]
    if self.region:
      return State.query(State.region == self.region).fetch(keys_only=True)
    # National championships are not based on residence, they're based on
    # citizenship.
    return None
