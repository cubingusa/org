import json

from google.appengine.ext import ndb

from src.scheduling.wcif.competition import CompetitionToWcif
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.models.scheduling.schedule import Schedule


class CompetitionWcifHandler(SchedulingBaseHandler):
  def get(self, competition_id, schedule_id=-1):
    if not self.SetCompetition(competition_id, edit_access_needed=False, login_required=False):
      return
    if schedule_id != -1:
      if not self.SetSchedule(int(schedule_id)):
        return
      schedule = self.schedule
    else:
      schedule = Schedule.query(ndb.AND(Schedule.competition == self.competition.key,
                                        Schedule.is_live == True)).get()
    self.response.headers.add('Content-Type', 'application/json')
    json_object = CompetitionToWcif(self.competition, schedule)
    if self.request.get('pretty'):
      self.response.write(json.dumps(json_object, sort_keys=True, indent=2))
    else:
      self.response.write(json.dumps(json_object))
