import datetime

from google.cloud import ndb

from app.models.state import State
from app.models.wca.base import BaseModel
from app.models.wca.country import Country
from app.models.wca.event import Event

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

    state = None
    if ',' in row['cityName']:
      city_split = row['cityName'].split(',')
      state_name = city_split[-1].strip()
      state = State.get_state(state_name)
      self.city_name = ','.join(city_split[:-1])
    if state:
      self.state = state.key
    else:
      self.city_name = row['cityName']
    self.country = ndb.Key(Country, row['countryId'])

  @staticmethod
  def Filter():
    # Only load US competitions that haven't been cancelled, plus Worlds.
    def filter_row(row):
      return ((row['countryId'] == 'USA' and int(row['cancelled']) != 1) or
              ('World' in row['name'] and 'Championship' in row['name']))
    return filter_row

  @staticmethod
  def ColumnsUsed():
    return ['year', 'month', 'day', 'endMonth', 'endDay', 'cellName', 'eventSpecs',
            'latitude', 'longitude', 'cityName', 'countryId', 'name']

  def GetWCALink(self):
    return 'https://worldcubeassociation.org/competitions/%s' % self.key.id()

  def GetEventsString(self):
    return ','.join([e.id() for e in self.events])
