from google.cloud import ndb

from app.models.region import Region
from app.models.state import State
from app.models.wca.competition import Competition

class Championship(ndb.Model):
  national_championship = ndb.BooleanProperty()
  region = ndb.KeyProperty(kind=Region)
  state = ndb.KeyProperty(kind=State)
  is_pbq = ndb.BooleanProperty()

  competition = ndb.KeyProperty(kind=Competition)

  year = ndb.ComputedProperty(lambda self: self.competition.get().year)

  residency_deadline = ndb.DateTimeProperty()
  residency_timezone = ndb.StringProperty()

  @staticmethod
  def NationalsId(year):
    return str(year)

  @staticmethod
  def RegionalsId(year, region, is_pbq=False):
    return '%s_%d%s' % (region.key.id(), year, '_pbq' if is_pbq else '')

  @staticmethod
  def StateChampionshipId(year, state, is_pbq=False):
    return '%s_%d%s' % (state.key.id(), year, '_pbq' if is_pbq else '')

  def GetEligibleStateKeys(self):
    if self.state:
      return [self.state]
    if self.region:
      extra_states = []
      if self.year < 2023:
        if self.region.id() == 'ne':
          return State.query(ndb.OR(State.region == ndb.Key(Region, 'nwe'),
                                    State.region == ndb.Key(Region, 'mda'))).fetch(keys_only=True)
        if self.region.id() == 'w':
          extra_states = [ndb.Key(State, 'co'), ndb.Key(State, 'ut'), ndb.Key(State, 'az')]
        if self.region.id() == 's':
          extra_states = [ndb.Key(State, 'nm')]
        if self.region.id() == 'nw':
          extra_states = [ndb.Key(State, 'id'), ndb.Key(State, 'mt'), ndb.Key(State, 'wy')]
      return State.query(State.region == self.region).fetch(keys_only=True) + extra_states
    # National championships are not based on residence, they're based on
    # citizenship.
    return None
