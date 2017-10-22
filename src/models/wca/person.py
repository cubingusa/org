from google.appengine.ext import ndb

from src.models.wca.country import Country

class Person(ndb.Model):
  # Most recent details
  name = ndb.StringProperty()
  country = ndb.KeyProperty(kind=Country)
  gender = ndb.StringProperty()

class PersonDetails(ndb.Model):
  person = ndb.KeyProperty(kind=Person)
  subid = ndb.IntegerProperty()

  name = ndb.StringProperty()
  country = ndb.KeyProperty(kind=Country)
  gender = ndb.StringProperty()

  @staticmethod
  def Id(person_id, subid):
    return '%s_%d' % (person_id, subid)
