import datetime
import json
import urllib
import webapp2

from src.handlers.oauth import OAuthBaseHandler
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler


class NewScheduleHandler(SchedulingBaseHandler):
  def get(self, competition_id):
    if not self.SetCompetition(competition_id):
      return
    self.redirect('/authenticate?' + urllib.urlencode({
        'scope': 'public email manage_competitions',
        'callback': webapp2.uri_for('new_schedule_callback', _full=True),
        'handler_data': competition_id,
    }))


class NewScheduleCallbackHandler(OAuthBaseHandler, SchedulingBaseHandler):
  def get(self):
    OAuthBaseHandler.get(self)
    if not self.auth_token:
      return

    competition_id = self.handler_data
    if not self.SetCompetition(competition_id):
      return

    response = self.GetWcaApi('/api/v0/competitions/%s/wcif' % competition_id)
    if response.status != 200:
      self.redirect(webapp2.uri_for('index', unknown=1))
      return
    response_json = json.loads(response.read())

    schedule = Schedule()
    schedule.competition = self.competition.key
    schedule.creation_time = datetime.datetime.now()
    schedule.last_update_time = schedule.creation_time
    schedule.is_live = False
    schedule.put()

    self.redirect(webapp2.uri_for('edit_schedule', schedule_version=schedule.key.id()))
