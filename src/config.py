from src.models.app_settings import AppSettings

def GetAppConfig(is_admin):
  config = {}
  config['webapp2_extras.sessions'] = {
    'secret_key': str(AppSettings.Get().session_secret_key),
    'is_admin': is_admin,
  }

  return config
