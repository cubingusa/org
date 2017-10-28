from google.appengine.ext import ndb

from src.models.state import State
from src.models.wca.person import Person

class User(ndb.Model):
  wca_person = ndb.KeyProperty(kind=Person)
  city = ndb.StringProperty()
  state = ndb.KeyProperty(kind=State)

  # TODO: record historical states so that policies on changing location can be enforced.
