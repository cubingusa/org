from src import common
from src.scheduling.competition_details import CompetitionDetails
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.jinja import JINJA_ENVIRONMENT


class EventDisplayHandler(SchedulingBaseHandler):
  def get(self, competition_id):
    if not self.SetCompetition(competition_id, edit_access_needed=False, login_required=False):
      return
    template = JINJA_ENVIRONMENT.get_template('scheduling/event_display.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'competition': self.competition,
        'competition_details': CompetitionDetails(self.user, self.competition),
    }))
