from google.cloud import ndb

from app.models.eligibility import LockedResidency
from app.models.eligibility import RegionalChampionshipEligibility
from app.models.eligibility import StateChampionshipEligibility
from app.models.state import State
from app.models.wca.person import Person

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
  # Defined at end of file (it's a circular reference so we can't define here)
  # updater = ndb.KeyProperty(kind=User)


class User(ndb.Model):
  wca_person = ndb.KeyProperty(kind=Person)
  # WARNING: this is only updated when the user logs in, and may be outdated.
  # Prefer wca_person.name when possible.
  name = ndb.StringProperty()
  email = ndb.StringProperty()
  roles = ndb.StringProperty(repeated=True)

  city = ndb.StringProperty()
  state = ndb.KeyProperty(kind=State)

  latitude = ndb.IntegerProperty()
  longitude = ndb.IntegerProperty()

  last_login = ndb.DateTimeProperty()

  updates = ndb.StructuredProperty(UserLocationUpdate, repeated=True)
  regional_eligibilities = ndb.StructuredProperty(RegionalChampionshipEligibility, repeated=True)
  state_eligibilities = ndb.StructuredProperty(StateChampionshipEligibility, repeated=True)
  locked_residencies = ndb.StructuredProperty(LockedResidency, repeated=True)

  def HasAnyRole(self, roles):
    for role in self.roles:
      if role in roles:
        return True
    return False


UserLocationUpdate.updater = ndb.KeyProperty(kind=User)
UserLocationUpdate._fix_up_properties()
