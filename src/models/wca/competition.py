from google.appengine.ext import ndb

from src.models.state import State
from src.models.wca.event import Event

class Competition(ndb.Model):
  start_date = ndb.DateProperty()
  end_date = ndb.DateProperty()
  year = ndb.IntegerProperty()

  name = ndb.StringProperty()
  short_name = ndb.StringProperty()

  events = ndb.KeyProperty(kind=Event, repeated=True)
  
  latitude = ndb.IntegerProperty()
  longitude = ndb.IntegerProperty()

  country = ndb.KeyProperty(kind=Country)
  city_name = ndb.StringProperty()
  state = ndb.KeyProperty(kind=State)
