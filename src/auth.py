import datetime

from src.models.user import UserLocationUpdate

def CanEditLocation(user, editor):
  if user == editor:
    last_update = (UserLocationUpdate.query(UserLocationUpdate.user == user.key)
                                     .order(-UserLocationUpdate.update_time)
                                     .get())
    if last_update and datetime.datetime.now() - last_update.update_time < datetime.timedelta(days=365):
      return False
    return True
  else:
    return False

def CanViewUser(user, viewer):
  return user == viewer
