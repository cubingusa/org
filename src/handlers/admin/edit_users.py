from src.handlers.admin.admin_base import AdminBaseHandler
from src import common
from src.jinja import JINJA_ENVIRONMENT
from src.models.user import Roles
from src.models.user import User

# This handler shows all users so that admins can edit them.

class EditUsersHandler(AdminBaseHandler):
  def get(self):
    all_users = User.query().order(User.name).fetch()
    template = JINJA_ENVIRONMENT.get_template('admin/edit_users.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'users': all_users,
    }))

  def PermittedRoles(self):
    return Roles.AdminRoles()
