from src import common
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.scheduling.competition_details import CompetitionDetails


class EventDisplayHandler(SchedulingBaseHandler):
  def get(self, competition_id, schedule_version=-1):
    if not self.SetCompetition(competition_id, edit_access_needed=False, login_required=False):
      return
    if schedule_version != -1:
      if not self.SetSchedule(int(schedule_version)):
        return
      schedule = self.schedule
    else:
      # CompetitionDetails will pick the right schedule.
      schedule = None
    template = JINJA_ENVIRONMENT.get_template('scheduling/event_display.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'competition': self.competition,
        'competition_details': CompetitionDetails(self.user, self.competition, schedule),
        'not_live_warning': schedule_version != -1,
    }))
