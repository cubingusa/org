from flask import Blueprint, render_template
from google.cloud import ndb

from app.lib import common
from app.models.state import State
from app.models.wca.event import Event
from app.models.wca.rank import RankAverage
from app.models.wca.rank import RankSingle

bp = Blueprint('state_rankings', __name__)
client = ndb.Client()

@bp.route('/state_rankings')
def state_rankings():
  with client.context():
    return render_template('state_rankings.html',
                           c=common.Common(wca_disclaimer=True))

@bp.route('/async/state_rankings/<event_id>/<state_id>/<use_average>')
def state_rankings_table(event_id, state_id, use_average):
  with client.context():
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
        .order(ranking_class.best)
        .fetch(100))

    people = ndb.get_multi([ranking.person for ranking in rankings])
    people_by_id = {person.key.id() : person for person in people}

    return render_template('state_rankings_table.html',
                           c=common.Common(),
                           is_average=(use_average == '1'),
                           rankings=rankings,
                           people_by_id=people_by_id)
