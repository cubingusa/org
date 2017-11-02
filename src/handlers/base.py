import datetime
import webapp2

from webapp2_extras import sessions

from src.models.user import Roles
from src.models.user import User

# Log out every week.
LOGOUT_INTERVAL = datetime.timedelta(days=7)

class BaseHandler(webapp2.RequestHandler):
  def dispatch(self):
    # Get a session store for this request.
    self.session_store = sessions.get_store(request=self.request)

    if 'wca_account_number' in self.session and 'login_time' in self.session:
      login_time = datetime.datetime.utcfromtimestamp(self.session['login_time'])
      current_time = datetime.datetime.now()
      if current_time - login_time > LOGOUT_INTERVAL:
        del self.session['wca_account_number']
        del self.session['login_time']

    try:
      is_cron = ('X-Appengine-Cron' in self.request.headers and
                 self.request.headers['X-Appengine-Cron'])
      redirect_target = None
      if not is_cron and self.RequireAuth():
        if self.user is None:
          redirect_target = '/login'
        elif not self.user.HasAnyRole(self.PermittedRoles() + [Roles.GLOBAL_ADMIN]):
          redirect_target = '/'
      if redirect_target:
        self.redirect(redirect_target)
      else:
        # Dispatch the request.
        webapp2.RequestHandler.dispatch(self)
    finally:
      # Save all sessions.
      self.session_store.save_sessions(self.response)

  @webapp2.cached_property
  def session(self):
    # Returns a session using the default cookie key.
    return self.session_store.get_session()

  @webapp2.cached_property
  def user(self):
    if 'wca_account_number' in self.session:
      return User.get_by_id(self.session['wca_account_number'])
    return None

  # If True, is in AdminBaseHandler, verify that the user is logged in and has a
  # whitelisted role.
  def RequireAuth(self):
    return False

  # When PermittedRoles is True, the user must have one of these roles to access
  # this handler.  GLOBAL_ADMIN always has access.
  def PermittedRoles(self):
    return []
