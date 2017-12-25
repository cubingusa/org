import json

from google.appengine.ext import ndb

from src.scheduling.wcif.competition import CompetitionToWcif
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.models.scheduling.schedule import Schedule


class CompetitionWcifHandler(SchedulingBaseHandler):
  def get(self, competition_id):
    if not self.SetCompetition(competition_id, edit_access_needed=False, login_required=False):
      return
    schedule = Schedule.query(ndb.AND(Schedule.competition == self.competition.key,
                                      Schedule.is_live == True)).get()
    self.response.write(json.dumps(CompetitionToWcif(self.competition, schedule)))
