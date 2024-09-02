from google.cloud import ndb

from app.models.championship import Championship
from app.models.state import State

class RegionalChampionshipEligibility(ndb.Model):
  championship = ndb.KeyProperty(kind=Championship)
  year = ndb.ComputedProperty(lambda self: self.championship.get().year)
  region = ndb.ComputedProperty(lambda self: self.championship.get().region)


class StateChampionshipEligibility(ndb.Model):
  championship = ndb.KeyProperty(kind=Championship)
  year = ndb.ComputedProperty(lambda self: self.championship.get().year)
  state = ndb.ComputedProperty(lambda self: self.championship.get().state)

class LockedResidency(ndb.Model):
  year = ndb.NumberProperty()
  state = ndb.KeyProperty(kind=State)
