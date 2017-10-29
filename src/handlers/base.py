import datetime
import webapp2

from webapp2_extras import sessions

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
