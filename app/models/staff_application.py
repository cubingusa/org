from google.cloud import ndb

from app.models.wca.competition import Competition

class ApplicationSettings(ndb.Model):
  visible = ndb.BooleanProperty()
  open_to_new_applicants = ndb.BooleanProperty()
  description = ndb.TextProperty()
