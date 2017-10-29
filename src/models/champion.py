from google.appengine.ext import ndb

from src.models.championship import Championship
from src.models.wca.event import Event
from src.models.wca.result import Result

class Champion(ndb.Model):
  championship = ndb.KeyProperty(kind=Championship)
  event = ndb.KeyProperty(kind=Event)
  champions = ndb.KeyProperty(kind=Result, repeated=True)

  @staticmethod
  def Id(championship_id, event_id):
    return '%s_%s' % (championship_id, event_id)
