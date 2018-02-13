import logging
import json
import webapp2

from google.appengine.api import urlfetch
from google.appengine.ext import deferred
from google.appengine.ext import ndb

from src import common
from src.jinja import JINJA_ENVIRONMENT
from src.handlers.admin.admin_base import AdminBaseHandler
from src.handlers.scheduling.scheduling_base import SchedulingOAuthBaseHandler
from src.models.refresh_token import RefreshToken
from src.models.scheduling.competition import ScheduleCompetition
from src.models.scheduling.person import SchedulePerson
from src.models.user import User
from src.models.user import Roles
from src.models.wca.competition import Competition
from src.models.wca.country import Country
from src.scheduling.wcif.person import ImportPerson


class ImportOutput:
  def __init__(self):
    self.entities_to_put = []
    self.entities_to_delete = []
    self.errors = []


class UpdateCompetitionHandler(SchedulingOAuthBaseHandler):
  def get(self, competition_id):
    admin_override = False
    # This verifies intra-appengine requests.  See comment above FetchUrl for
    # explanation.
    if self.request.get('token'):
      token = RefreshToken.get_by_id(competition_id)
      if token and token.token == self.request.get('token'):
        admin_override = True
      else:
        self.response.set_status(400)
        self.response.write('mismatched token')
        return
    if not self.SetCompetition(competition_id, fail_if_not_found=False,
                               edit_access_needed=(not admin_override),
                               login_required=(not admin_override)):
      return
    if not self.GetToken():
      return

    response = self.GetWcaApi('/api/v0/competitions/%s/wcif' % competition_id)
    if response.status != 200:
      self.redirect(webapp2.uri_for('index', unknown=1))
      return
    response_json = json.loads(response.read())
    self.competition.name = response_json['name']
    self.competition.wca_competition = ndb.Key(Competition, competition_id)

    people = SchedulePerson.query(SchedulePerson.competition == self.competition.key).fetch()
    country_iso2s = set(person_data['countryIso2'] for person_data in response_json['persons'])
    countries = {country.iso2 : country.key.id()
                 for country in Country.query(Country.iso2.IN(country_iso2s))}
    out = ImportOutput()
    out.entities_to_put.append(self.competition)

    for person_data in response_json['persons']:
      ImportPerson(person_data, self.competition, out, people, countries)
    if out.errors:
      template = JINJA_ENVIRONMENT.get_template('scheduling/import_error.html')
      self.response.write(template.render({
          'c': common.Common(self),
          'errors': out.errors}))
      return
    ndb.put_multi(out.entities_to_put)
    ndb.delete_multi(out.entities_to_delete)
    if not admin_override:
      self.redirect(webapp2.uri_for('edit_competition', competition_id=competition_id))


# Every six hours, we reload the list of competitors from the WCA site.  In
# order to duplicate as little behavior as possible, we do this by fetching
# /scheduling/<competition_id>/update_competition.
#
# However, the user making these requests is not logged in.  Therefore we use
# the refresh token as a password, as this will be cycled in /update_competition
# and is never transmitted outside of app engine.
def FetchUrl(url):
  logging.info('Fetching %s' % url)
  result = urlfetch.fetch(url, deadline=60)
  if result.status_code != 200:
    logging.error(result.content)


class UpdateAllCompetitionsHandler(AdminBaseHandler):
  def get(self):
    for competition in ScheduleCompetition.query().iter():
      if competition.refresh_token and competition.refresh_token.get():
        logging.info('Updating competitor list for %s' % competition.key.id())
        token = competition.refresh_token.get().token
        deferred.defer(FetchUrl, webapp2.uri_for('update_competition',
                                                 competition_id=competition.key.id(),
                                                 _full=True) + '?token=' + token)

  def PermittedRoles(self):
    return Roles.AdminRoles()
