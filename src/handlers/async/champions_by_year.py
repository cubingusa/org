from google.appengine.ext import ndb

from src import common
from src.handlers.base import BaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.champion import Champion
from src.models.championship import Championship
from src.models.region import Region
from src.models.state import State
from src.models.wca.event import Event

# An async handler to return a table of the champions in a particular year.
class ChampionsByYearHandler(BaseHandler):
  def get(self, event_id, championship_type, championship_region):
    template = JINJA_ENVIRONMENT.get_template('champions_by_year.html')
    all_champions = []
    if championship_type == 'national':
      all_champions = [c for c in Champion.query(Champion.national_champion == True).iter()]
    elif championship_type == 'regional':
      all_champions = [c for c in Champion.query(Champion.region ==
                                                 ndb.Key(Region, championship_region)).iter()]
    elif championship_type == 'state':
      all_champions = [c for c in Champion.query(Champion.state ==
                                                 ndb.Key(State, championship_region)).iter()]
    all_champions = sorted([c for c in all_champions
                            if c.event == ndb.Key(Event, str(event_id))],
                           key = lambda c: c.championship.id(), reverse=True)
    self.response.write(template.render({
        'c': common.Common(self),
        'champions': all_champions,
    }))
