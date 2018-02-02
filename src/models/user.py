from google.appengine.api import search
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
 

class UserLocationUpdate(ndb.Model):
  city = ndb.StringProperty()
  state = ndb.KeyProperty(kind=State)

  update_time = ndb.DateTimeProperty()
  updater = ndb.KeyProperty(kind=User)


class User(ndb.Model):
  wca_person = ndb.KeyProperty(kind=Person)
  name = ndb.StringProperty()
  email = ndb.StringProperty()
  roles = ndb.StringProperty(repeated=True)

  city = ndb.StringProperty()
  state = ndb.KeyProperty(kind=State)

  latitude = ndb.IntegerProperty()
  longitude = ndb.IntegerProperty()

  last_login = ndb.DateTimeProperty()

  updates = ndb.StructuredProperty(kind=UserLocationUpdate, repeated=True)

  def HasAnyRole(self, roles):
    for role in self.roles:
      if role in roles:
        return True
    return False

  def put(self):
    self.__UpdateDocument()
    super(User, self).put()

  def put_async(self):
    self.__UpdateDocument()
    return super(User, self).put_async()

  # In order to be able to search for users by name, we have a search index
  # containing all users.  Each document in the index corresponds to a user,
  # and we can search by name, wca id, or city.
  @staticmethod
  def GetSearchIndex():
    return search.Index('users')

  def __UpdateDocument(self):
    fields = [search.TextField(name='name', value=self.name)]
    if self.wca_person:
      fields.append(search.TextField(name='wca_id', value=self.wca_person.id()))
    if self.city:
      fields.append(search.TextField(name='city', value=self.city))
    if self.latitude and self.longitude:
      fields.append(search.GeoField(
          name='location',
          value=search.GeoPoint(self.latitude / 1000000., self.longitude / 1000000.)))
    document = search.Document(
      doc_id=str(self.key.id()),
      fields=fields)
    User.GetSearchIndex().put(document)

  def DeleteUser(self):
    User.GetSearchIndex().delete(str(self.key.id()))
    self.key.delete()
