import datetime

from google.appengine.ext import ndb

from src.handlers.admin.admin_base import AdminBaseHandler
from src import common
from src.jinja import JINJA_ENVIRONMENT

from src.models.user import Roles
from src.models.user import User
from src.models.user import UserLocationUpdate
from src.models.state import State
from src.models.wca.person import Person

class UploadUsersHandler(AdminBaseHandler):
  def get(self):
    template = JINJA_ENVIRONMENT.get_template('admin/upload_users.html')
    self.response.write(template.render({
        'c': common.Common(self),
    }))

  def post(self):
    all_states = set([state_key.id() for state_key in State.query().iter(keys_only=True)])
    users_by_key = {}
    users_by_wca_id = {}
    for line in self.request.POST.get('file').file:
      linesplit = line.split('|')
      fname = linesplit[1].strip().decode('UTF-8')
      lname = linesplit[2].strip().decode('UTF-8')
      email = linesplit[3].strip()
      if 'NULL' in linesplit[4]:
        wca_id = ''
      else:
        wca_id = linesplit[4].strip().upper()
      if 'NULL' in linesplit[5]:
        account_id = 0
      else:
        account_id = linesplit[5].strip()
      city = linesplit[6].strip()
      state = linesplit[7].strip().lower()
      if state not in all_states:
        continue
      latitude = int(float(linesplit[8].strip()) * 1000000)
      longitude = int(float(linesplit[9].strip()) * 1000000)

      # Only upload users who have city, state, and some kind of ID.
      if not city or not state:
        continue
      if not wca_id and not account_id:
        continue
      # Give preference to users with a wca account number.
      if not account_id and wca_id in users_by_wca_id:
        continue
      if account_id and wca_id in users_by_key:
        del users_by_key[wca_id]

      id_to_use = account_id or wca_id
      
      user = User.get_by_id(id_to_use) or User(id=id_to_use)
      if wca_id:
        user.wca_person = ndb.Key(Person, wca_id)
      user.name = ' '.join([fname.title(), lname.title()])
      if email:
        user.email = email
      user.city = city
      user.state = ndb.Key(State, state.lower())
      if latitude:
        user.latitude = latitude
      if longitude:
        user.longitude = longitude
      users_by_key[id_to_use] = user
      users_by_wca_id[wca_id] = user

    futures = []
    for user in users_by_key.itervalues():
      # Also make a back-dated UserLocationUpdate.  We make it in the past so
      # that the user can immediately modify their location on the new site.
      update = UserLocationUpdate()
      update.user = user.key
      update.updater = user.key
      update.city = user.city
      update.state = user.state
      update.update_time = datetime.datetime(2016, 1, 1)
      futures.append(user.put_async())
      futures.append(update.put_async())
    for future in futures:
      future.wait()

  def PermittedRoles(self):
    return [Roles.WEBMASTER]
