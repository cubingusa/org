import json
import webapp2

from google.appengine.ext import ndb

from src import common
from src.jinja import JINJA_ENVIRONMENT
from src.handlers.scheduling.scheduling_base import SchedulingOAuthBaseHandler
from src.models.scheduling.competition import ScheduleCompetition
from src.models.scheduling.person import SchedulePerson
from src.models.user import User
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
    if not self.SetCompetition(competition_id, fail_if_not_found=False):
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
    self.redirect(webapp2.uri_for('edit_competition', competition_id=competition_id))
