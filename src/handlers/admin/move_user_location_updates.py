from google.appengine.ext import ndb

from src.handlers.admin.admin_base import AdminBaseHandler

from src.models.user import Roles
from src.models.user import User
from src.models.user import UserLocationUpdate

class MoveUserLocationUpdatesHandler(AdminBaseHandler):
  def get(self):
    entities_to_put = []
    entities_to_delete = []
    users = {}
    for user in User.query().iter():
      users[user.key.id()] = user
    for update in UserLocationUpdate.query().order(UserLocationUpdate.update_time).iter():
      user = users[update.user.id()]
      del update.user
      if not user.updates:
        user.updates = []
      user.updates.append(update)
      entities_to_delete.append(update.key)
    for user in users.itervalues():
      if user.updates:
        entities_to_put.append(user)
    ndb.delete_multi(entities_to_delete)
    ndb.put_multi(entities_to_put)

  def PermittedRoles(self):
    return Roles.AdminRoles()
