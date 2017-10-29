import webapp2

from webapp2_extras import sessions

from src.models.user import User

class BaseHandler(webapp2.RequestHandler):
  def dispatch(self):
    # Get a session store for this request.
    self.session_store = sessions.get_store(request=self.request)

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
