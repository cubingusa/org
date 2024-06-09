from google.cloud import ndb

class ApplicationSettings(ndb.Model):
  details = ndb.JsonProperty()
