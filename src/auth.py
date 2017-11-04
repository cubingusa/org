import datetime

from src.models.user import Roles
from src.models.user import UserLocationUpdate

def CanEditLocation(user, editor):
  if not editor:
    return False
  if editor.HasAnyRole(Roles.AdminRoles()):
    return True
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
  if not viewer:
    return False
  return (user == viewer or
          viewer.HasAnyRole(Roles.DelegateRoles()) or
          viewer.HasAnyRole(Roles.AdminRoles()))

def CanViewRoles(user, viewer):
  if not viewer:
    return False
  return (viewer.HasAnyRole(Roles.DelegateRoles()) or
          viewer.HasAnyRole(Roles.AdminRoles()))

def EditableRoles(user, editor):
  if not editor:
    return []
  if editor.HasAnyRole([Roles.GLOBAL_ADMIN]):
    return Roles.AllRoles()
  elif editor.HasAnyRole([Roles.WEBMASTER, Roles.DIRECTOR]):
    return [Roles.WEBMASTER, Roles.DIRECTOR]
  else:
    return []

def CanUploadDocuments(user):
  if not user:
    return False
  return user.HasAnyRole([Roles.GLOBAL_ADMIN, Roles.DIRECTOR])
