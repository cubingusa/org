from flask import abort, Blueprint, render_template
from google.cloud import ndb

from app.lib import auth
from app.lib import common
from app.models.championship import Championship
from app.models.region import Region
from app.models.state import State
from app.models.user import Roles
from app.models.wca.competition import Competition
from app.models.wca.country import Country

bp = Blueprint('edit_championships', __name__)
client = ndb.Client()

@bp.route('/add_championship/<competition_id>/<championship_type>')
def add_championship(competition_id, championship_type):
  with client.context():
    me = auth.user()
    if not me or not me.HasAnyRole(Roles.AdminRoles()):
      abort(403)
    competition = Competition.get_by_id(competition_id)
    if championship_type == 'national':
      championship_id = Championship.NationalsId(competition.year)
    elif championship_type == 'regional':
      championship_id = Championship.RegionalsId(competition.year,
                                                 competition.state.get().region.get())
    elif championship_type == 'state':
      championship_id = Championship.StateChampionshipId(competition.year,
                                                         competition.state.get())
    championship = (Championship.get_by_id(championship_id) or
                    Championship(id=championship_id))

    if championship_type == 'national':
      championship.national_championship = True
    elif championship_type == 'regional':
      championship.region = competition.state.get().region
    elif championship_type == 'state':
      championship.state = competition.state
    championship.competition = competition.key
    championship.put()
    # TODO: if we changed a championship we should update champions and eligibilities.
    return redirect('/admin/edit_championships')
    

@bp.route('/delete_championship/<championship_id>')
def delete_championship(championship_id):
  with client.context():
    me = auth.user()
    if not me or not me.HasAnyRole(Roles.AdminRoles()):
      abort(403)
    championship = Championship.get_by_id(championship_id)
    championship.key.delete()
    # TODO: if we changed a championship we should update champions and eligibilities.
    return redirect('/admin/edit_championships')


@bp.route('/edit_championships')
def edit_users():
  with client.context():
    me = auth.user()
    if not me or not me.HasAnyRole(Roles.AdminRoles()):
      abort(403)

    all_us_competitions = (
        Competition.query(Competition.country == ndb.Key(Country, 'USA'))
                   .order(Competition.name)
                   .fetch())

    national_championships = (
        Championship.query(Championship.national_championship == True)
                    .order(-Championship.year)
                    .fetch())
    regional_championships = (
        Championship.query(Championship.region != None)
                    .order(Championship.region)
                    .order(-Championship.year)
                    .fetch())
    state_championships = (
        Championship.query(Championship.state != None)
                    .order(Championship.state)
                    .order(-Championship.year)
                    .fetch())
    print(len(national_championships), len(regional_championships), len(state_championships))

    states = State.query().fetch()
    regions = Region.query().fetch()

    return render_template('admin/edit_championships.html',
                           c = common.Common(),
                           all_us_competitions = all_us_competitions,
                           national_championships = national_championships,
                           regional_championships = regional_championships,
                           state_championships = state_championships,
                           states = states,
                           regions = regions)
