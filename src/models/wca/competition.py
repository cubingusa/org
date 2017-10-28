import datetime

from google.appengine.ext import ndb

from src.models.state import State
from src.models.wca.base import BaseModel
from src.models.wca.country import Country
from src.models.wca.event import Event

class Competition(BaseModel):
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

  def ParseFromDict(self, row):
    self.start_date = datetime.date(int(row['year']), int(row['month']), int(row['day']))
    self.end_date = datetime.date(int(row['year']), int(row['endMonth']), int(row['endDay']))
    self.year = int(row['year'])

    self.name = row['name']
    self.short_name = row['cellName']

    self.events = [ndb.Key(Event, event_id) for event_id in row['eventSpecs'].split(' ')]

    self.latitude = int(row['latitude'])
    self.longitude = int(row['longitude'])

    self.city_name = row['cityName']
    # TODO: parse state
    self.country = ndb.Key(Country, row['countryId'])
