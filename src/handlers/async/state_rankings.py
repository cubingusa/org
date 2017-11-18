from google.appengine.ext import ndb

from src import common
from src.handlers.base import BaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.state import State
from src.models.wca.event import Event
from src.models.wca.rank import RankAverage
from src.models.wca.rank import RankSingle

# An async handler to return a table of the champions in a particular year.
class StateRankingsHandler(BaseHandler):
  def get(self, event_id, state_id, use_average):
    template = JINJA_ENVIRONMENT.get_template('state_rankings_table.html')
    ranking_class = RankAverage if use_average == '1' else RankSingle
    state = State.get_by_id(state_id)
    if not state:
      self.response.write('Unrecognized state %s' % state_id)
      return
    event = Event.get_by_id(event_id)
    if not event:
      self.response.write('Unrecognized event %s' % event_id)
      return
    rankings = (ranking_class.query(
        ndb.AND(ranking_class.event == event.key,
                ranking_class.state == state.key))
        .order(ranking_class.worldRank)
        .fetch(100))

    self.response.write(template.render({
        'c': common.Common(self),
        'is_average': use_average == '1',
        'rankings': rankings,
    }))
