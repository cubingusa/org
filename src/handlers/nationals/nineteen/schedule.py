from src import common
from src.jinja import JINJA_ENVIRONMENT
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.scheduling.competition_details import CompetitionDetails


class Schedule2019Handler(SchedulingBaseHandler):
  def get(self):
    if not self.SetCompetition('CubingUSANationals2019',
                               login_required=False, edit_access_needed=False):
      return

    template = JINJA_ENVIRONMENT.get_template('nationals/2019/schedule.html')
    competition_details = CompetitionDetails(self.user, self.competition)

    self.response.write(template.render({
        'c': common.Common(self),
        'competition': self.competition,
        'competition_details': competition_details,
    }))
