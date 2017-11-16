from src.handlers.admin.admin_base import AdminBaseHandler
from src import common
from src.jinja import JINJA_ENVIRONMENT
from src.models.user import Roles
from src.models.user import User

# This handler shows all users so that admins can edit them.

class EditUsersHandler(AdminBaseHandler):
  def get(self, filter_text):
    all_users = []
    for user in User.query().order(User.name).iter():
      if filter_text.lower() in user.name.lower():
        all_users.append(user)
      if len(all_users) > 25:
        break
    template = JINJA_ENVIRONMENT.get_template('admin/edit_users_table.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'users': all_users,
    }))

  def PermittedRoles(self):
    return Roles.AdminRoles()
