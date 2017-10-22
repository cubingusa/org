from google.appengine.ext import ndb

from src.models.wca.event import Event
from src.models.wca.person import Person

class Format(ndb.Model):
  person = ndb.KeyProperty(kind=Person)
  event = ndb.KeyProperty(kind=Event)
  best = ndb.IntegerProperty()
  is_average = ndb.BooleanProperty()

  @staticmethod
  def Id(person_id, event_id, is_average):
    return '%s_%s_%s' % (person_id, event_id, 'a' if is_average else 's')
