from google.appengine.ext import ndb

from src import common
from src.handlers.admin.admin_base import AdminBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.championship import Championship
from src.models.region import Region
from src.models.state import State
from src.models.user import Roles
from src.models.wca.competition import Competition
from src.models.wca.country import Country

class AddChampionshipHandler(AdminBaseHandler):
  def get(self, competition_id, championship_type):
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
      championship.region = competiiton.state.get().region
    elif championship_type == 'state':
      championship.state = competition.state
    championship.competition = competition.key
    championship.put()
    # TODO: if we changed a championship we should update champions and eligibilities.
    self.redirect_to('edit_championships')
    

class DeleteChampionshipHandler(AdminBaseHandler):
  def get(self, championship_id):
    championship = Championship.get_by_id(championship_id)
    championship.key.delete()
    # TODO: if we changed a championship we should update champions and eligibilities.
    self.redirect_to('edit_championships')


class EditChampionshipsHandler(AdminBaseHandler):
  def get(self):
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
    print len(national_championships), len(regional_championships), len(state_championships)

    states = State.query().fetch()
    regions = Region.query().fetch()

    template = JINJA_ENVIRONMENT.get_template('admin/edit_championships.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'all_us_competitions': all_us_competitions,
        'national_championships': national_championships,
        'regional_championships': regional_championships,
        'state_championships': state_championships,
        'states': states,
        'regions': regions,
    }))

  def PermittedRoles(self):
    return Roles.AdminRoles()
