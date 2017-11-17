import datetime

from google.appengine.ext import ndb

from src import auth
from src import common
from src.handlers.base import BaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.state import State
from src.models.user import Roles
from src.models.user import User
from src.models.user import UserLocationUpdate

class EditUserHandler(BaseHandler):
  def return_error(self, error):
    template = JINJA_ENVIRONMENT.get_template('error.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'error': error,
    }))

  def get_user(self, user_id):
    if user_id != -1:
      return User.get_by_id(user_id)
    else:
      return self.user

  def TemplateDict(self, user):
    return {
        'c': common.Common(self),
        'user': user,
        'all_roles': Roles.AllRoles(),
        'editing_location_enabled': auth.CanEditLocation(user=user, editor=self.user),
        'can_view_roles': auth.CanViewRoles(user=user, viewer=self.user),
        'editable_roles': auth.EditableRoles(user=user, editor=self.user),
    }

  def get(self, user_id=-1):
    user = self.get_user(user_id)
    if user is None:
      self.return_error('Unrecognized user ID %s provided.' % user_id)
      return

    if not auth.CanViewUser(user=user, viewer=self.user):
      self.return_error('You\'re not authorized to view this user.')
      return

    template = JINJA_ENVIRONMENT.get_template('edit_user.html')
    self.response.write(template.render(self.TemplateDict(user)))

  def post(self, user_id=-1):
    # Users with a WCA account linked have integer IDs.
    # Users without a WCA account linked have string IDs (their WCA ID).
    user = self.get_user(user_id)
    if user is None:
      self.return_error('Unrecognized user ID %s provided.' % user_id)
      return
    city = self.request.POST['city']
    state_id = self.request.POST['state']
    if state_id == 'empty':
      state_id = ''

    if self.request.POST['lat'] and self.request.POST['lng']:
      lat = int(self.request.POST['lat'])
      lng = int(self.request.POST['lng'])
    else:
      lat = 0
      lng = 0
    template_dict = {}

    old_state_id = user.state.id() if user.state else ''
    changed_location = user.city != city or old_state_id != state_id
    user_modified = False
    if auth.CanEditLocation(user=user, editor=self.user) and changed_location:
      user.city = city
      if state_id:
        user.state = ndb.Key(State, state_id)
      else:
        del user.state
      user.latitude = lat
      user.longitude = lng
      user_modified = True

      if changed_location:
        # Also save the Update.
        update = UserLocationUpdate()
        update.user = user.key
        update.updater = self.user.key
        update.city = city
        update.update_time = datetime.datetime.now()
        if state_id:
          update.state = ndb.Key(State, state_id)
        update.put()
    elif changed_location:
      template_dict['unauthorized'] = True

    for role in auth.EditableRoles(user=user, editor=self.user):
      if role in self.request.POST and role not in user.roles:
        user.roles.append(role)
        user_modified = True
      elif role not in self.request.POST and role in user.roles:
        user.roles.remove(role)
        user_modified = True
      
    if user_modified:
      user.put()
      template_dict['successful'] = True

    # Note that edit privileges may have changed.
    template_dict.update(self.TemplateDict(user))
 
    template = JINJA_ENVIRONMENT.get_template('edit_user.html')
    self.response.write(template.render(template_dict))
    
# A mostly-static handler that renders a given template name.
def BasicHandler(template_path):
  class Handler(BaseHandler):
    def get(self):
      template = JINJA_ENVIRONMENT.get_template(template_path)
      self.response.write(template.render({
          'c': common.Common(self),
      }))

  return Handler
