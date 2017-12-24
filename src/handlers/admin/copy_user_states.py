from google.appengine.ext import ndb

from src.handlers.admin.admin_base import AdminBaseHandler
from src.models.user import Roles
from src.models.user import User

# This handler is a one-off to copy states from User to Person.

class CopyUserStatesHandler(AdminBaseHandler):
  def get(self):
    states = []
    people_to_fetch = []
    for user in User.query().iter():
      if user.state and user.wca_person:
        states.append(user.state)
        people_to_fetch.append(user.wca_person)

    people_to_put = []
    for person, state in zip(ndb.get_multi(people_to_fetch), states):
      if person:
        person.state = state
        people_to_put.append(person)
    ndb.put_multi(people_to_put)

  def PermittedRoles(self):
    return [Roles.GLOBAL_ADMIN, Roles.WEBMASTER]
