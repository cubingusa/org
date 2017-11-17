from src.handlers.base import BaseHandler
from src.models.user import Roles
from src.models.user import User

# Note that this handler does NOT use AdminHandler.  For bootstrapping reasons,
# we need to be able to assign roles without anyone already having roles
# assigned.
class AssignRoleHandler(BaseHandler):
  def get(self, user_id, role):
    user = User.get_by_id(user_id)
    if not user:
      self.response.write('error: unrecognized user %s' % user_id)
      self.response.set_status(400)
      return
    if role not in Roles.AllRoles():
      self.response.write('error: unrecognized role %s' % role)
      self.response.set_status(400)
      return
    if user.HasAnyRole(role):
      self.response.write('user already had role %s' % role)
      return
    user.roles.append(role)
    user.put()
    self.response.write('ok')
