from google.appengine.ext import ndb

from src import auth
from src import common
from src.handlers.base import BaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.state import State
from src.models.user import User

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

  def get(self, user_id=-1):
    user_id = int(user_id)
    user = self.get_user(user_id)
    if user is None:
      self.return_error('Unrecognized user ID %d provided.' % user_id)
      return

    if not auth.CanViewUser(user=user, viewer=self.user):
      self.return_error('You\'re not authorized to view this user.')
      return

    template = JINJA_ENVIRONMENT.get_template('edit_user.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'user': user,
        'editing_location_enabled': auth.CanEditLocation(user=user, editor=self.user),
    }))

  def post(self, user_id=-1):
    user_id = int(user_id)
    user = self.get_user(user_id)
    if user is None:
      self.return_error('Unrecognized user ID %d provided.' % user_id)
      return
    city = self.request.POST['city']
    state_id = self.request.POST['state']
    template_dict = {
        'c': common.Common(self),
        'user': user,
    }
    if auth.CanEditLocation(user=user, editor=self.user):
      user.city = city
      if state_id:
        user.state = ndb.Key(State, state_id)
      else:
        del user.state
      user.put()
      template_dict['successful'] = True
    elif user.city != city or user.state != state_id:
      template_dict['unauthorized'] = True

    # Note that this might have changed.
    template_dict['editing_location_enabled'] = auth.CanEditLocation(user=user, editor=self.user)
      
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
