from src import common
from src.jinja import JINJA_ENVIRONMENT
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.scheduling.competition_details import CompetitionDetails


class Events2018Handler(SchedulingBaseHandler):
  def get(self):
    if not self.SetCompetition('CubingUSANationals2018', login_required=False):
      return

    template = JINJA_ENVIRONMENT.get_template('nationals/2018/events.html')
    competition_details = CompetitionDetails(self.user, self.competition)

    competition_details.SetQualifyingTime('333', 3000, is_average=True)
    competition_details.SetQualifyingTime('222', 1200, is_average=True)
    competition_details.SetQualifyingTime('444', 7000, is_average=True)
    competition_details.SetQualifyingTime('555', 11000, is_average=True)
    competition_details.SetQualifyingTime('666', 21000, is_average=True)
    competition_details.SetQualifyingTime('777', 28500, is_average=True)
    competition_details.SetQualifyingTime('333oh', 3500, is_average=True)
    competition_details.SetQualifyingTime('333fm', 4500, is_average=True)
    competition_details.SetQualifyingTime('minx', 10500, is_average=True)
    competition_details.SetQualifyingTime('pyram', 1200, is_average=True)
    competition_details.SetQualifyingTime('skewb', 1200, is_average=True)
    competition_details.SetQualifyingTime('clock', 1500, is_average=True)
    competition_details.SetQualifyingTime('sq1', 3500, is_average=True)
    competition_details.SetQualifyingTime('333ft', 7500, is_average=True)
    competition_details.SetQualifyingTime('333bf', 24000, is_average=False)
    competition_details.SetQualifyingTime('444bf', 60000, is_average=False)
    competition_details.SetQualifyingTime('555bf', 120000, is_average=False)
    competition_details.SetQualifyingTime('333mbf', 939999999, is_average=False)
    
    self.response.write(template.render({
        'c': common.Common(self),
        'competition': self.competition,
        'competition_details': competition_details,
    }))
