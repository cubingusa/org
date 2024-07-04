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
  sender_address = ndb.StringProperty()
  sender_name = ndb.StringProperty()
  review_settings = ndb.JsonProperty()

class SavedView(ndb.Model):
  view_id = ndb.StringProperty()
  competition = ndb.KeyProperty(kind=Competition)
  details = ndb.JsonProperty()

  @staticmethod
  def Key(competition_id, view_id):
    return '%s_%s' % (competition_id, view_id)

class MailTemplate(ndb.Model):
  competition = ndb.KeyProperty(kind=Competition)
  title = ndb.StringProperty()
  subject_line = ndb.StringProperty()
  design = ndb.JsonProperty()
  html = ndb.TextProperty()

class MailHook(ndb.Model):
  competition = ndb.KeyProperty(kind=Competition)
  # Values: FormSubmitted, PropertyAssigned.
  hook_type = ndb.StringProperty()
  template = ndb.KeyProperty(kind=MailTemplate)
  # For FormSubmitted..
  form_id = ndb.IntegerProperty()
  # For PropertyAssigned.
  property_id = ndb.IntegerProperty()
  property_value = ndb.IntegerProperty()
  # Either "User" or an email address.
  recipient = ndb.StringProperty()

class Review(ndb.Model):
  user = ndb.KeyProperty(kind=User)
  reviewers = ndb.KeyProperty(kind=User, repeated=True)
  declined_reviewers = ndb.KeyProperty(kind=User, repeated=True)
  declined_reviewer_timestamps = ndb.DateTimeProperty(repeated=True)
  competition = ndb.KeyProperty(kind=Competition)
  review_form_id = ndb.IntegerProperty()
  submitted_at = ndb.DateTimeProperty()
  deadline = ndb.DateTimeProperty()
  updated_at = ndb.DateTimeProperty()
  updated_by = ndb.KeyProperty(kind=User)
  details = ndb.JsonProperty()

  @staticmethod
  def Key(competition_id, review_form_id, user_id):
    return '%s_%d_%s' % (competition_id, review_form_id, user_id)
