from google.appengine.api import search

from src import common
from src.handlers.admin.admin_base import AdminBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.user import Roles
from src.models.user import User

# This handler shows all users so that admins can edit them.

class EditUsersHandler(AdminBaseHandler):
  def get(self, filter_text):
    sort_options = search.SortOptions([
        search.SortExpression(expression='name',
                              direction=search.SortExpression.ASCENDING)])
    query_options = search.QueryOptions(limit=30, sort_options=sort_options)

    query = search.Query(query_string=filter_text, options=query_options)
    users_to_show = []
    for document in User.GetSearchIndex().search(query):
      user = User.get_by_id(document.doc_id)
      if user:
        users_to_show.append(user)

    template = JINJA_ENVIRONMENT.get_template('admin/edit_users_table.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'users': users_to_show,
    }))

  def PermittedRoles(self):
    return Roles.AdminRoles()
