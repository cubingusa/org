from google.appengine.ext import ndb

from src import common
from src.handlers.base import BaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.champion import Champion
from src.models.championship import Championship
from src.models.region import Region
from src.models.state import State
from src.models.wca.event import Event

# An async handler to return a table of the champions by year or region.
class ChampionsTableHandler(BaseHandler):
  def get(self, event_id, championship_type, championship_region='', year=0):
    is_national = championship_type == 'national'
    is_regional = championship_type == 'regional'
    is_state = championship_type == 'state'

    template = JINJA_ENVIRONMENT.get_template('champions_table.html')
    all_champions = []
    filters = []

    if is_national:
      filters.append(Champion.national_champion == True)
    elif year:
      filters.append(Champion.year == int(year))
      if is_regional:
        filters.append(Champion.region != None)
      elif is_state:
        filters.append(Champion.state != None)
    elif is_regional:
      filters.append(Champion.region == ndb.Key(Region, championship_region))
    elif is_state:
      filters.append(Champion.state == ndb.Key(State, championship_region))

    filters.append(Champion.event == ndb.Key(Event, str(event_id)))
    all_champions = Champion.query(ndb.AND(*filters)).fetch()
    if year and is_regional:
      all_champions.sort(key = lambda c: c.region.id())
    elif year and is_state:
      all_champions.sort(key = lambda c: c.state.id())
    else:
      all_champions.sort(key = lambda c: c.championship.id(), reverse = True)

    self.response.write(template.render({
        'c': common.Common(self),
        'champions': all_champions,
    }))
