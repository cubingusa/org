import httplib
import json
import logging
import urllib
import webapp2

from src.handlers.base import BaseHandler
from src.models.app_settings import AppSettings

def GetClientId(app_settings, scope):
  if 'manage_competitions' in scope:
    return app_settings.wca_oauth_comp_management_client_id
  else:
    return app_settings.wca_oauth_client_id

def GetClientSecret(app_settings, scope):
  if 'manage_competitions' in scope:
    return app_settings.wca_oauth_comp_management_client_secret
  else:
    return app_settings.wca_oauth_client_secret

class AuthenticateHandler(BaseHandler):
  def get(self):
    app_settings = AppSettings.Get()
    # Always use /oauth_callback as the redirect URI, as far as the WCA oauth
    # system is concerned.
    # For staging, use the prod /oauth_callback endpoint.  OAuth does not allow
    # wildcards in redirect URIs, and there will potentially be many different
    # foo-dot-staging-cubingusa-org domains.
    if 'staging-cubingusa-org' in self.request.host:
      redirect_uri = 'https://cubingusa.org/oauth_callback'
    else:
      redirect_uri = self.request.host_url + '/oauth_callback'
    params = {
        'client_id': GetClientId(app_settings, self.request.get('scope')),
        'response_type': 'code',
        'redirect_uri': redirect_uri,
        'state': json.dumps({
            'handler_data': self.request.get('handler_data'),
            'scope': self.request.get('scope'),
            'oauth_redirect_uri': redirect_uri,
            'actual_redirect_uri': self.request.get('callback'),
        }),
        'scope': self.request.get('scope'),
    }

    oauth_url = 'https://www.worldcubeassociation.org/oauth/authorize?' + urllib.urlencode(params)
    self.redirect(oauth_url)

class OAuthCallbackHandler(BaseHandler):
  def get(self):
    state = json.loads(self.request.get('state'))
    self.redirect(str(state['actual_redirect_uri']) + '?' +
                  self.request.query_string)

class OAuthBaseHandler(BaseHandler):
  # Subclasses should first call OAuthBaseHandler.GetFromCode(self), then check
  # if self.auth_token is None.  If so, they must return early.
  def GetTokenFromCode(self):
    self.auth_token = None
    code = self.request.get('code')
    if not code:
      self.response.set_status(400)
      return

    state = json.loads(self.request.get('state'))
    self.handler_data = state['handler_data']
    scope = state['scope']
    app_settings = AppSettings.Get()

    # Get OAuth token.
    post_data = {
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': GetClientId(app_settings, scope),
        'client_secret': GetClientSecret(app_settings, scope),
        'redirect_uri': state['oauth_redirect_uri'],
    }
    conn = httplib.HTTPSConnection('www.worldcubeassociation.org/oauth/token')
    conn.request('POST', '', urllib.urlencode(post_data), {})
    response = conn.getresponse()
    if response.status != 200:
      self.response.set_status(response.status)
      logging.error('Error from WCA OAuth: ' + response.read())
      return
    response_json = json.loads(response.read())
    self.auth_token = response_json['access_token']
    # The handler may choose to save this for later use.
    self.refresh_token = response_json['refresh_token']

  # Subclasses may use GetFromRefreshToken instead if they're holding a
  # RefreshToken.  This fetches an auth token and updates the refresh token.
  def GetTokenFromRefreshToken(self, refresh_token):
    post_data = {
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token.token,
        'client_id': GetClientId(app_settings, scope),
        'client_secret': GetClientSecret(app_settings, scope),
    }
    conn = httplib.HTTPSConnection('www.worldcubeassociation.org/oauth/token')
    conn.request('POST', '', urllib.urlencode(post_data), {})
    response = conn.getresponse()
    if response.status != 200:
      self.response.set_status(response.status)
      logging.error('Error from WCA OAuth: ' + response.read())
      return
    response_json = json.loads(response.read())
    self.auth_token = response_json['access_token']
    refresh_token.token = response_json['refresh_token']
    refresh_token.put()

  def GetWcaApi(self, path):
    # OAuth token obtained, now read information about the person.
    headers = {'Authorization': 'Bearer ' + self.auth_token}
    conn = httplib.HTTPSConnection('www.worldcubeassociation.org' + path)
    conn.request('GET', '', '', headers)
    response = conn.getresponse()
    return response


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
