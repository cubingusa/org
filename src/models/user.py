from google.appengine.ext import ndb

from src.models.state import State
from src.models.wca.person import Person

class Roles:
  GLOBAL_ADMIN = 'GLOBAL_ADMIN'
  DIRECTOR = 'DIRECTOR'
  WEBMASTER = 'WEBMASTER'
  SENIOR_DELEGATE = 'SENIOR_DELEGATE'
  DELEGATE = 'DELEGATE'
  CANDIDATE_DELEGATE = 'CANDIDATE_DELEGATE'

  @staticmethod
  def AllRoles():
    return [Roles.GLOBAL_ADMIN, Roles.DIRECTOR, Roles.WEBMASTER,
            Roles.SENIOR_DELEGATE, Roles.DELEGATE, Roles.CANDIDATE_DELEGATE]

  @staticmethod
  def DelegateRoles():
    return [Roles.SENIOR_DELEGATE, Roles.DELEGATE, Roles.CANDIDATE_DELEGATE]

  @staticmethod
  def AdminRoles():
    return [Roles.GLOBAL_ADMIN, Roles.DIRECTOR, Roles.WEBMASTER]

class User(ndb.Model):
  wca_person = ndb.KeyProperty(kind=Person)
  name = ndb.StringProperty()
  email = ndb.StringProperty()
  roles = ndb.StringProperty(repeated=True)

  city = ndb.StringProperty()
  state = ndb.KeyProperty(kind=State)

  latitude = ndb.IntegerProperty()
  longitude = ndb.IntegerProperty()

  def HasAnyRole(self, roles):
    for role in self.roles:
      if role in roles:
        return True
    return False

class UserLocationUpdate(ndb.Model):
  city = ndb.StringProperty()
  state = ndb.KeyProperty(kind=State)

  update_time = ndb.DateTimeProperty()
  user = ndb.KeyProperty(kind=User)
  updater = ndb.KeyProperty(kind=User)
