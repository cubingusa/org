import json
import urllib
import webapp2

from google.appengine.ext import ndb

from src.handlers.base import BaseHandler
from src.handlers.oauth import OAuthBaseHandler
from src.models.scheduling.competition import ScheduleCompetition
from src.models.user import User
from src.models.wca.competition import Competition


class UpdateCompetitionHandler(BaseHandler):
  def post(self):
    competition_id = self.request.POST['competitionid']
    self.redirect('/authenticate?' + urllib.urlencode({
        'scope': 'public email manage_competitions',
        'callback': webapp2.uri_for('update_competition_callback', _full=True),
        'handler_data': competition_id,
    }))


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
    current_editors = set(editor.id() for editor in competition.editors)
    for person in response_json['persons']:
      if str(person['wcaUserId']) in current_editors:
        continue
      if person['delegatesCompetition'] or person['organizesCompetition']:
        competition.editors.append(ndb.Key(User, str(person['wcaUserId'])))
    competition.put()
    self.redirect(webapp2.uri_for('edit_competition', competition_id=competition_id))
