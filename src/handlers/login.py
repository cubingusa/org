import datetime
import json
import urllib
import webapp2

from google.appengine.ext import ndb

from src.handlers.base import BaseHandler
from src.handlers.oauth import OAuthBaseHandler
from src.models.user import Roles
from src.models.user import User
from src.models.wca.person import Person

class LoginHandler(BaseHandler):
  def get(self):
    self.redirect('/authenticate?' + urllib.urlencode({
        'scope': 'public email',
        'callback': webapp2.uri_for('login_callback', _full=True),
        'handler_data': self.request.referer if self.request.referer else '/',
    }))

class LoginCallbackHandler(OAuthBaseHandler):
  def get(self):
    OAuthBaseHandler.get(self)
    if not self.auth_token:
      return

    response = self.GetWcaApi('/api/v0/me')
    if response.status != 200:
      self.response.set_status(response.status)
      logging.error('Error from WCA: ' + self.response.read())
      return

    # Save the account information we need.
    wca_info = json.loads(response.read())['me']
    self.session['wca_account_number'] = str(wca_info['id'])
    self.session['login_time'] = (
        datetime.datetime.now() - datetime.datetime.utcfromtimestamp(0)).total_seconds()
    user = User.get_by_id(str(wca_info['id'])) or User(id=str(wca_info['id']))
    if 'wca_id' in wca_info and wca_info['wca_id']:
      user.wca_person = ndb.Key(Person, wca_info['wca_id'])
    else:
      del user.wca_person

    if 'name' in wca_info:
      user.name = wca_info['name']
    else:
      del user.name

    if 'email' in wca_info:
      user.email = wca_info['email']
    else:
      del user.email

    user.roles = [role for role in user.roles if role not in Roles.DelegateRoles()]
    if 'delegate_status' in wca_info:
      if wca_info['delegate_status'] == 'senior_delegate':
        user.roles.append(Roles.SENIOR_DELEGATE)
      elif wca_info['delegate_status'] == 'delegate':
        user.roles.append(Roles.DELEGATE)
      elif wca_info['delegate_status'] == 'candidate_delegate':
        user.roles.append(Roles.CANDIDATE_DELEGATE)

    if wca_info['wca_id']:
      wca_id_user = User.get_by_id(wca_info['wca_id'])
    else:
      wca_id_user = None
    if wca_id_user:
      if wca_id_user.city and not user.city:
        user.city = wca_id_user.city
      if wca_id_user.state and not user.state:
        user.state = wca_id_user.state
      if wca_id_user.latitude and not user.latitude:
        user.latitude = wca_id_user.latitude
      if wca_id_user.longitude and not user.longitude:
        user.longitude = wca_id_user.longitude
      wca_id_user.key.delete()

    user.last_login = datetime.datetime.now()

    user.put()
    self.redirect(str(self.handler_data))

class LogoutHandler(BaseHandler):
  def get(self):
    if 'wca_account_number' in self.session:
      del self.session['wca_account_number']
    if 'login_time' in self.session:
      del self.session['login_time']

    if self.request.referer:
      self.redirect(self.request.referer)
    else:
      self.redirect('/')
