from google.cloud import ndb

from app.models.user import User
from app.models.wca.competition import Competition

class SubmittedForm(ndb.Model):
  user = ndb.KeyProperty(kind=User)
  competition = ndb.KeyProperty(kind=Competition)
  form_id = ndb.IntegerProperty()
  submitted_at = ndb.DateTimeProperty()
  updated_at = ndb.DateTimeProperty()
  details = ndb.JsonProperty()

  @staticmethod
  def Key(competition_id, form_id, user_id):
    return '%s_%d_%s' % (competition_id, form_id, user_id)

class UserSettings(ndb.Model):
  user = ndb.KeyProperty(kind=User)
  competition = ndb.KeyProperty(kind=Competition)
  properties = ndb.JsonProperty()

  @staticmethod
  def Key(competition_id, user_id):
    return '%s_%d' % (competition_id, user_id)

class ApplicationSettings(ndb.Model):
  details = ndb.JsonProperty()
