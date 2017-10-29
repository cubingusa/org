from src.models.app_settings import AppSettings

def GetAppConfig():
  config = {}
  config['webapp2_extras.sessions'] = {
    'secret_key': AppSettings.Get().session_secret_key,
  }

  return config
