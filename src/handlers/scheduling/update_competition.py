import json
import urllib
import webapp2

from google.appengine.ext import ndb

from src import common
from src.handlers.base import BaseHandler
from src.handlers.oauth import OAuthBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.scheduling.competition import ScheduleCompetition
from src.models.scheduling.person import SchedulePerson
from src.models.user import User
from src.models.wca.competition import Competition
from src.models.wca.country import Country
from src.scheduling.wcif.person import ImportPerson


class UpdateCompetitionHandler(BaseHandler):
  def get(self, competition_id):
    self.redirect('/authenticate?' + urllib.urlencode({
        'scope': 'public email manage_competitions',
        'callback': webapp2.uri_for('update_competition_callback', _full=True),
        'handler_data': competition_id,
    }))


class ImportOutput:
  def __init__(self):
    self.entities_to_put = []
    self.entities_to_delete = []
    self.errors = []


class UpdateCompetitionCallbackHandler(OAuthBaseHandler):
  def get(self):
    OAuthBaseHandler.get(self)
    if not self.auth_token:
      return

    competition_id = self.handler_data
    response = self.GetWcaApi('/api/v0/competitions/%s/wcif' % competition_id)
    if response.status != 200:
      self.redirect(webapp2.uri_for('index', unknown=1))
      return
    response_json = json.loads(response.read())
    competition = (ScheduleCompetition.get_by_id(competition_id) or
                   ScheduleCompetition(id=competition_id))
    competition.name = response_json['name']
    competition.wca_competition = ndb.Key(Competition, competition_id)

    people = SchedulePerson.query(SchedulePerson.competition == competition.key).fetch()
    country_iso2s = set(person_data['countryIso2'] for person_data in response_json['persons'])
    countries = {country.iso2 : country.key.id()
                 for country in Country.query(Country.iso2.IN(country_iso2s))}
    out = ImportOutput()

    for person_data in response_json['persons']:
      ImportPerson(person_data, competition, out, people, countries)
    if out.errors:
      template = JINJA_ENVIRONMENT.get_template('scheduling/import_error.html')
      self.response.write(template.render({
          'c': common.Common(self),
          'errors': out.errors}))
      return
    ndb.put_multi(out.entities_to_put)
    ndb.delete_multi(out.entities_to_delete)
    self.redirect(webapp2.uri_for('edit_competition', competition_id=competition_id))
