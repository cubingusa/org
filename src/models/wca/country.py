from google.appengine.ext import ndb

from src.models.wca.continent import Continent

class Country(ndb.Model):
  name = ndb.StringProperty()
  continent = ndb.KeyProperty(kind=Continent)
  iso2 = ndb.StringProperty()
