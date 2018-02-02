from google.appengine.ext import ndb

from src.models.championship import Championship

class RegionalChampionshipEligibility(ndb.Model):
  championship = ndb.KeyProperty(kind=Championship)
  year = ndb.ComputedProperty(lambda self: self.championship.get().year)
  region = ndb.ComputedProperty(lambda self: self.championship.get().region)


class StateChampionshipEligibility(ndb.Model):
  championship = ndb.KeyProperty(kind=Championship)
  year = ndb.ComputedProperty(lambda self: self.championship.get().year)
  state = ndb.ComputedProperty(lambda self: self.championship.get().state)
