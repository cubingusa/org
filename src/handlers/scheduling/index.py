import datetime
import json
import urllib
import webapp2

from src import common
from src.handlers.base import BaseHandler
from src.handlers.oauth import OAuthBaseHandler
from src.jinja import JINJA_ENVIRONMENT


class SchedulingIndexHandler(BaseHandler):
  def get(self):
    if not self.user:
      template = JINJA_ENVIRONMENT.get_template('scheduling/index.html')
      self.response.write(template.render({
          'c': common.Common(self),
          'logged_out': True,
      }))
      return
    self.redirect('/authenticate?' + urllib.urlencode({
        'scope': 'public email manage_competitions',
        'callback': webapp2.uri_for('index_callback', _full=True),
    }))


class SchedulingIndexCallbackHandler(OAuthBaseHandler):
  def get(self):
    OAuthBaseHandler.get(self)
    if not self.auth_token:
      return

    competition_id_to_name = {}
    # List upcoming competitions that this person can manage.
    response = self.GetWcaApi(
        '/api/v0/competitions?managed_by_me=true&start=%s' %
            (datetime.datetime.now() - datetime.timedelta(days=30)).isoformat())

    if response.status != 200:
      self.redirect(webapp2.uri_for('index', unknown=1))
      return
    response_json = json.loads(response.read())
    for competition in response_json:
      competition_id_to_name[competition['id']] = competition['name']

    # TODO: Also list all competitions that this person has edit access to,
    # including all competitions for webmasters.

    template = JINJA_ENVIRONMENT.get_template('scheduling/index.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'competition_id_to_name': competition_id_to_name,
    }))
