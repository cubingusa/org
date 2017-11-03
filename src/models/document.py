from google.appengine.ext import ndb

from src.models.championship import Championship
from src.models.user import User
from src.models.wca.event import Event
from src.models.wca.result import Result

class Document(ndb.Model):
  uploader = ndb.KeyProperty(kind=User)
  upload_time = ndb.DateTimeProperty()
  deletion_time = ndb.DateTimeProperty()
  section = ndb.StringProperty()

  blob_key = ndb.StringProperty()
  name = ndb.StringProperty()
  original_filename = ndb.StringProperty()
