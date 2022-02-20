from flask import Blueprint
from google.cloud import ndb

from app.lib import auth
from app.models.region import Region
from app.models.state import State
from app.models.user import Roles

client = ndb.Client()

bp = Blueprint('states', __name__)

def MakeRegion(region_id, region_name, championship_name, all_regions, futures):
  region = Region.get_by_id(region_id) or Region(id=region_id)
  region.name = region_name
  region.championship_name = championship_name
  futures.append(region.put_async())
  all_regions[region_id] = region
  return region

def MakeState(state_id, state_name, region, is_state, all_states, futures):
  state = State.get_by_id(state_id) or State(id=state_id)
  state.name = state_name
  state.region = region.key
  state.is_state = is_state
  futures.append(state.put_async())
  all_states[state_id] = state
  return state

@bp.route('/update_states')
def update_states():
  me = auth.user()
  if not me or not me.HasAnyRole([Roles.GLOBAL_ADMIN, Roles.WEBMASTER]):
    return render_template('error.html', c=Common(), error='You\'re not authorized!')

  with client.context():
    futures = []
    all_regions = {}
    NORTHEAST = MakeRegion('ne', 'Northeast', 'Northeastern',all_regions, futures)
    SOUTHEAST = MakeRegion('se', 'Southeast', 'Southeastern', all_regions, futures)
    GREAT_LAKES = MakeRegion('gl', 'Great Lakes', 'Great Lakes', all_regions, futures)
    HEARTLAND = MakeRegion('hl', 'Heartland', 'Heartland', all_regions, futures)
    SOUTH = MakeRegion('s', 'South', 'Southern', all_regions, futures)
    NORTHWEST = MakeRegion('nw', 'Northwest', 'Northwestern', all_regions, futures)
    WEST = MakeRegion('w', 'West', 'Western', all_regions, futures)

    for future in futures:
      future.wait()
    del futures[:]

    all_states = {}
    for state_id, state_name, region in (
        ('al', 'Alabama', SOUTHEAST),
        ('ak', 'Alaska', NORTHWEST),
        ('az', 'Arizona', WEST),
        ('ar', 'Arkansas', SOUTH),
        ('ca', 'California', WEST),
        ('co', 'Colorado', WEST),
        ('ct', 'Connecticut', NORTHEAST),
        ('de', 'Delaware', NORTHEAST),
        ('fl', 'Florida', SOUTHEAST),
        ('ga', 'Georgia', SOUTHEAST),
        ('hi', 'Hawaii', WEST),
        ('id', 'Idaho', NORTHWEST),
        ('il', 'Illinois', GREAT_LAKES),
        ('in', 'Indiana', GREAT_LAKES),
        ('ia', 'Iowa', HEARTLAND),
        ('ks', 'Kansas', HEARTLAND),
        ('ky', 'Kentucky', GREAT_LAKES),
        ('la', 'Louisiana', SOUTH),
        ('me', 'Maine', NORTHEAST),
        ('md', 'Maryland', NORTHEAST),
        ('ma', 'Massachusetts', NORTHEAST),
        ('mi', 'Michigan', GREAT_LAKES),
        ('mn', 'Minnesota', HEARTLAND),
        ('ms', 'Mississippi', SOUTH),
        ('mo', 'Missouri', HEARTLAND),
        ('mt', 'Montana', NORTHWEST),
        ('ne', 'Nebraska', HEARTLAND),
        ('nv', 'Nevada', WEST),
        ('nh', 'New Hampshire', NORTHEAST),
        ('nj', 'New Jersey', NORTHEAST),
        ('nm', 'New Mexico', WEST),
        ('ny', 'New York', NORTHEAST),
        ('nc', 'North Carolina', SOUTHEAST),
        ('nd', 'North Dakota', HEARTLAND),
        ('oh', 'Ohio', GREAT_LAKES),
        ('ok', 'Oklahoma', SOUTH),
        ('or', 'Oregon', NORTHWEST),
        ('pa', 'Pennsylvania', NORTHEAST),
        ('ri', 'Rhode Island', NORTHEAST),
        ('sc', 'South Carolina', SOUTHEAST),
        ('sd', 'South Dakota', HEARTLAND),
        ('tn', 'Tennessee', SOUTHEAST),
        ('tx', 'Texas', SOUTH),
        ('ut', 'Utah', WEST),
        ('vt', 'Vermont', NORTHEAST),
        ('va', 'Virginia', SOUTHEAST),
        ('wa', 'Washington', NORTHWEST),
        ('wv', 'West Virginia', NORTHEAST),
        ('wi', 'Wisconsin', GREAT_LAKES),
        ('wy', 'Wyoming', NORTHWEST)):
      MakeState(state_id, state_name, region, True, all_states, futures)

    for territory_id, territory_name, region in (
        ('dc', 'D. C.', NORTHEAST),
        ('pr', 'Puerto Rico', SOUTHEAST),
        ('gu', 'Guam', WEST),
        ('mp', 'Northern Mariana Islands', WEST),
        ('as', 'American Samoa', WEST),
        ('vi', 'U.S. Virgin Islands', SOUTHEAST)):
      MakeState(territory_id, territory_name, region, False, all_states, futures)

    for future in futures:
      future.wait()
    del futures[:]

    for region in Region.query().iter():
      if region.key.id() not in all_regions:
        region.delete()
    for state in State.query().iter():
      if state.key.id() not in all_states:
        state.delete()
    return 'ok'
