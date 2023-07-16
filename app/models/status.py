from google.cloud import ndb

from app.models.user import User
from app.models.wca.competition import Competition

class GroupStatus(ndb.Model):
  competition = ndb.KeyProperty(kind=Competition)
  group_id = ndb.IntegerProperty()
  ready_time = ndb.DateTimeProperty()
  ready_set_by = ndb.KeyProperty(kind=User)
  called_time = ndb.DateTimeProperty()
  called_by = ndb.KeyProperty(kind=User)

  @staticmethod
  def Id(competition_id, group_id):
    return '%s_%d' % (competition_id, group_id)

class CompetitionMetadata(ndb.Model):
  delay_minutes = ndb.IntegerProperty()
  message = ndb.StringProperty()
  refresh_ts = ndb.DateTimeProperty()
  image_url = ndb.StringProperty()
