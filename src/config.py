from src.models.app_settings import AppSettings

def GetAppConfig():
  config = {}
  config['webapp2_extras.sessions'] = {
    'secret_key': str(AppSettings.Get().session_secret_key),
  }

  return config
