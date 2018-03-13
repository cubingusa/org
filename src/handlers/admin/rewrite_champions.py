from google.appengine.ext import ndb

from src.handlers.admin.admin_base import AdminBaseHandler
from src.models.champion import Champion
from src.models.user import Roles

# This handler is a one-off to rewrite champions with the year attached.

class RewriteChampionsHandler(AdminBaseHandler):
  def get(self):
    ndb.put_multi(Champion.query().fetch())

  def PermittedRoles(self):
    return [Roles.GLOBAL_ADMIN, Roles.WEBMASTER]
