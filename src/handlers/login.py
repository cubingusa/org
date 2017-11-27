import datetime
import httplib
import json
import urllib
import webapp2

from google.appengine.ext import ndb

from src.handlers.base import BaseHandler
from src.models.app_settings import AppSettings
from src.models.user import Roles
from src.models.user import User
from src.models.wca.person import Person

class LoginHandler(BaseHandler):
  def get(self):
    app_settings = AppSettings.Get()
    params = {
        'client_id': app_settings.wca_oauth_client_id,
        'response_type': 'code',
        'redirect_uri': webapp2.uri_for('login_callback', _full=True),
        'state': self.request.referer if self.request.referer else '/',
        'scope': 'public email',
    }

    oauth_url = 'https://www.worldcubeassociation.org/oauth/authorize?' + urllib.urlencode(params)
    self.redirect(oauth_url)

class LoginCallbackHandler(BaseHandler):
  def get(self):
    code = self.request.get('code')
    if not code:
      self.response.set_status(400)
      return

    app_settings = AppSettings.Get()

    # Get OAuth token.
    post_data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': webapp2.uri_for('login_callback', _full=True),
        'client_id': app_settings.wca_oauth_client_id,
        'client_secret': app_settings.wca_oauth_client_secret,
    }
    conn = httplib.HTTPSConnection('www.worldcubeassociation.org/oauth/token')
    conn.request('POST', '', urllib.urlencode(post_data), {})
    response = conn.getresponse()
    if response.status != 200:
      self.response.set_status(response.status)
      return
    auth_token = json.loads(response.read())['access_token']

    # OAuth token obtained, now read information about the person.
    headers = {'Authorization': 'Bearer ' + auth_token}
    conn = httplib.HTTPSConnection('www.worldcubeassociation.org/api/v0/me')
    conn.request('GET', '', '', headers)
    response = conn.getresponse()
    if response.status != 200:
      self.response.set_status(response.status)
      return

    # Save the account information we need.
    wca_info = json.loads(response.read())['me']
    self.session['wca_account_number'] = str(wca_info['id'])
    self.session['login_time'] = (
        datetime.datetime.now() - datetime.datetime.utcfromtimestamp(0)).total_seconds()
    user = User.get_by_id(str(wca_info['id'])) or User(id=str(wca_info['id']))
    if 'wca_id' in wca_info:
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

    wca_id_user = User.get_by_id(wca_info['wca_id'])
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
    self.redirect(str(self.request.get('state')))

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
