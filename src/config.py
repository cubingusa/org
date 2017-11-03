from src.models.app_settings import AppSettings

def GetAppConfig(is_admin):
  return {
    'is_admin': is_admin,
    'webapp2_extras.sessions': {
      'secret_key': str(AppSettings.Get().session_secret_key),
    },
  }
