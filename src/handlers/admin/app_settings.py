from src import common
from src.handlers.base import BaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.app_settings import AppSettings

# This handler allows app-level settings to be configured.  This uses Google's
# authentication to control access since, during app setup, login doesn't work
# until this handler has been used.

class AppSettingsHandler(BaseHandler):
  def get(self):
    template = JINJA_ENVIRONMENT.get_template('admin/app_settings.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'settings': AppSettings.Get(),
    }))

  def post(self):
    settings = AppSettings.Get()
    settings.session_secret_key = self.request.POST['session_secret_key']
    settings.wca_oauth_client_id = self.request.POST['wca_oauth_client_id']
    settings.wca_oauth_client_secret = self.request.POST['wca_oauth_client_secret']
    settings.google_maps_api_key = self.request.POST['google_maps_api_key']
    settings.put()
    template = JINJA_ENVIRONMENT.get_template('admin/app_settings.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'settings': settings,
    }))
