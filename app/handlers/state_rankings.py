from flask import Blueprint, render_template
from google.cloud import ndb

from app.lib import common
from app.models.region import Region
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

@bp.route('/state_records')
def state_records():
  with client.context():
    return render_template('state_records.html',
                           c=common.Common(wca_disclaimer=True))

@bp.route('/async/state_rankings/<event_id>/<state_id>/<use_average>')
def state_rankings_table(event_id, state_id, use_average):
  with client.context():
    ranking_class = RankAverage if use_average == '1' else RankSingle
    state = State.get_by_id(state_id)
    states = []
    if state:
      states = [state.key]
    else:
      region = Region.get_by_id(state_id)
      if not region:
        self.response.write('Unrecognized state %s' % state_id)
        return
      states = State.query(State.region == region.key).fetch(keys_only=True)
    event = Event.get_by_id(event_id)
    if not event:
      self.response.write('Unrecognized event %s' % event_id)
      return
    rankings = (ranking_class.query(
        ndb.AND(ranking_class.event == event.key,
                ranking_class.state.IN(states)))
        .order(ranking_class.best)
        .fetch(100))

    people = ndb.get_multi([ranking.person for ranking in rankings])
    people_by_id = {person.key.id() : person for person in people}

    return render_template('state_rankings_table.html',
                           c=common.Common(),
                           is_average=(use_average == '1'),
                           rankings=rankings,
                           people_by_id=people_by_id,
                           regional=len(states) > 1)

@bp.route('/async/state_records/event/<event_id>/<use_average>')
def state_records_table_by_state(event_id, use_average):
  with client.context():
    ranking_class = RankAverage if use_average == '1' else RankSingle
    event = Event.get_by_id(event_id)
    if not event:
      self.response.write('Unrecognized event %s' % event_id)
      return

    regions = Region.query(Region.obsolete==False).fetch()
    states_by_region = {region.key.id() : [] for region in regions}
    states_by_id = {}
    for state in State.query().iter():
      states_by_region[state.region.id()] += [state]
      states_by_id[state.key.id()] = state
    rankings = sorted((ranking_class.query(
        ndb.AND(ranking_class.event == event.key,
                ranking_class.is_state_record == True))
                       .fetch()), key=lambda ranking: states_by_id[ranking.state.id()].region.id() +
                                                      states_by_id[ranking.state.id()].name)
    state_records = {}
    regional_records = {}
    for ranking in rankings:
      state_records[ranking.state.id()] = ranking
      region = ranking.state.get().region.id()
      if region not in regional_records or regional_records[region].best > ranking.best:
        regional_records[region] = ranking

    people = ndb.get_multi([ranking.person for ranking in rankings])
    people_by_id = {person.key.id() : person for person in people}

    return render_template('state_records_table_by_state.html',
                           c=common.Common(),
                           is_average=(use_average == '1'),
                           rankings=rankings,
                           people_by_id=people_by_id,
                           states_by_region=states_by_region,
                           regions=regions,
                           state_records=state_records,
                           regional_records=regional_records,
                           states_by_id=states_by_id)

@bp.route('/async/state_records/state/<state_id>/<use_average>')
def state_records_table_by_event(state_id, use_average):
  with client.context():
    ranking_class = RankAverage if use_average == '1' else RankSingle
    state = State.get_by_id(state_id)
    states = []
    if state:
      states = [state.key]
    else:
      region = Region.get_by_id(state_id)
      if not region:
        self.response.write('Unrecognized state %s' % state_id)
        return
      states = State.query(State.region == region.key).fetch(keys_only=True)

    events_by_id = {event.key.id() : event for event in Event.query().fetch()}
    records_by_event = {}
    for ranking in ranking_class.query(ndb.AND(ranking_class.state.IN(states),
                                               ranking_class.is_state_record == True)).iter():
      if ranking.event.id() not in records_by_event or ranking.best < records_by_event[ranking.event.id()].best:
        records_by_event[ranking.event.id()] = ranking
    rankings = sorted(records_by_event.values(), key=lambda ranking: events_by_id[ranking.event.id()].rank)

    people = ndb.get_multi([ranking.person for ranking in rankings])
    people_by_id = {person.key.id() : person for person in people}

    return render_template('state_records_table_by_event.html',
                           c=common.Common(),
                           is_average=(use_average == '1'),
                           rankings=rankings,
                           people_by_id=people_by_id,
                           events_by_id=events_by_id,
                           regional=len(states) > 1)
