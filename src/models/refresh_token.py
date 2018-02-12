from google.appengine.ext import ndb

from src.models.user import User

class RefreshToken(ndb.Model):
  # The user who created this refresh token.
  user = ndb.KeyProperty(kind=User)
  token = ndb.StringProperty()
  # The time that this token was first created.
  creation_time = ndb.DateTimeProperty()
  # The time that this token will no longer be needed, and CubingUSA will
  # delete it rather than continue to refresh it.
  expiry_time = ndb.DateTimeProperty()
