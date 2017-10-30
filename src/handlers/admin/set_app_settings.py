from src.handlers.admin.admin_base import AdminBaseHandler
from src.models.app_settings import AppSettings
from src.models.user import Roles

# This handler configures app-level settings that should be updated with care.
# As such, access is very limited.

class SetAppSettingsHandler(AdminBaseHandler):
  def get(self, setting, value):
    app_settings = AppSettings.Get()
    if setting == 'session_secret_key':
      app_settings.session_secret_key = value
    elif setting == 'wca_oauth_client_id':
      app_settings.wca_oauth_client_id = value
    elif setting == 'wca_oauth_client_secret':
      app_settings.wca_oauth_client_secret = value
    else:
      self.response.write('error: unrecognized setting %s' % setting)
      self.response.set_status(400)
      return
    app_settings.put()
    self.response.write('ok')

  def PermittedRoles(self):
    return [Roles.GLOBAL_ADMIN]