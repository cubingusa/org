from google.appengine.ext import ndb

from src.models.wca.country import Country

class Person(ndb.Model):
  # Most recent details
  name = ndb.StringProperty()
  country = ndb.KeyProperty(kind=Country)
  gender = ndb.StringProperty()

  # All details
  all_names = ndb.StringProperty(repeated=True)
  all_countries = ndb.KeyProperty(kind=Country, repeated=True)
  all_genders = ndb.StringProperty(repeated=True)

  @staticmethod
  def GetId(row):
    return row['id']

  def ParseFromDict(self, rows):
    subids = sorted(rows.keys())
    for subid in subids:
      if subid == 1:
        self.name = rows[subid]['name']
        self.country = ndb.Key(Country, rows[subid]['countryId'])
        self.gender = rows[subid]['gender']
      self.all_names.append(rows[subid]['name'])
      self.all_countries.append(ndb.Key(Country, rows[subid]['countryId']))
      self.all_genders.append(rows[subid]['gender'])
