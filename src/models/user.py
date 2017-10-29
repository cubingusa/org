from google.appengine.ext import ndb

from src.models.state import State
from src.models.wca.person import Person

class User(ndb.Model):
  wca_person = ndb.KeyProperty(kind=Person)
  name = ndb.StringProperty()
  email = ndb.StringProperty()

  city = ndb.StringProperty()
  state = ndb.KeyProperty(kind=State)

class UserLocationUpdate(ndb.Model):
  city = ndb.StringProperty()
  state = ndb.KeyProperty(kind=State)

  update_time = ndb.DateTimeProperty()
  user = ndb.KeyProperty(kind=User)
  updater = ndb.KeyProperty(kind=User)
