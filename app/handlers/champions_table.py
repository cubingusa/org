from flask import Blueprint, render_template
from google.cloud import ndb

from app.lib import common
from app.models.champion import Champion
from app.models.championship import Championship
from app.models.region import Region
from app.models.state import State
from app.models.wca.event import Event

bp = Blueprint('champions_table', __name__)
client = ndb.Client()


@bp.route('/async/champions_by_year/<event_id>/<championship_type>/<championship_region>')
@bp.route('/async/champions_by_region/<event_id>/<championship_type>/<year>')
def champions_table(event_id, championship_type, championship_region='', year=0):
  with client.context():
    is_national = championship_type == 'national'
    is_regional = championship_type == 'regional'
    is_state = championship_type == 'state'
    is_world = championship_type == 'world'
    is_nac = championship_type == 'nac'

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
    elif is_world:
      filters.append(Champion.world_champion == True)
    elif is_nac:
      filters.append(Champion.nac_champion == True)

    filters.append(Champion.event == ndb.Key(Event, str(event_id)))
    all_champions = Champion.query(ndb.AND(*filters)).fetch()
    if year and is_regional:
      all_champions.sort(key = lambda c: c.region.id())
      championship_formatter = lambda c: c.region.get().name
      all_regions = Region.query().fetch()
    elif year and is_state:
      all_champions.sort(key = lambda c: c.state.get().name)
      championship_formatter = lambda c: c.state.get().name
      all_states = State.query().fetch()
    else:
      all_champions.sort(key = lambda c: c.championship.id(), reverse = True)
      championship_formatter = lambda c: c.year

    return render_template('champions_table.html',
                           c=common.Common(),
                           champions=all_champions,
                           championship_formatter=championship_formatter)
