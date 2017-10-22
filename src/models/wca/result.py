from google.appengine.ext import ndb

from src.models.wca.competition import Competition
from src.models.wca.event import Event
from src.models.wca.format import Format
from src.models.wca.person import Person
from src.models.wca.round import RoundType

class Result(ndb.Model):
  competition = ndb.KeyProperty(kind=Competition)
  event = ndb.KeyProperty(kind=Event)
  round_type = ndb.KeyProperty(kind=RoundType)
  person = ndb.KeyProperty(kind=Person)
  fmt = ndb.KeyProperty(kind=Format)

  pos = ndb.IntegerProperty()
  best = ndb.IntegerProperty()
  average = ndb.IntegerProperty()
  values = ndb.IntegerProperty(repeated=True)

  regional_single_record = ndb.StringProperty()
  regional_average_record = ndb.StringProperty()
