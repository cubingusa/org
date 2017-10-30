from src.handlers.admin.admin_base import AdminBaseHandler
from src.models.user import Roles
from src.post_import import mutations

# This handler runs code that is run at the end of each database import.  There
# should be no need to run it as a one-off, unless we're generating new data.

class PostImportMutationsHandler(AdminBaseHandler):
  def get(self):
    mutations.DoMutations()
    self.response.write('running in background')

  def PermittedRoles(self):
    return [Roles.GLOBAL_ADMIN, Roles.WEBMASTER]
