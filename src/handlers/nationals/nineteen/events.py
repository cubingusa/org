from src import common
from src.jinja import JINJA_ENVIRONMENT
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.scheduling.competition_details import CompetitionDetails


class Events2019Handler(SchedulingBaseHandler):
  def get(self):
    if not self.SetCompetition('CubingUSANationals2019',
                               login_required=False, edit_access_needed=False):
      return

    template = JINJA_ENVIRONMENT.get_template('nationals/2019/events.html')
    competition_details = CompetitionDetails(self.user, self.competition)

    competition_details.SetQualifyingTime('333', 3000, is_average=True)
    competition_details.SetQualifyingTime('222', 1100, is_average=True)
    competition_details.SetQualifyingTime('444', 6000, is_average=True)
    competition_details.SetQualifyingTime('555', 10000, is_average=True)
    competition_details.SetQualifyingTime('666', 18500, is_average=True)
    competition_details.SetQualifyingTime('777', 25500, is_average=True)
    competition_details.SetQualifyingTime('333oh', 3000, is_average=True)
    competition_details.SetQualifyingTime('333fm', 3800, is_average=True)
    competition_details.SetQualifyingTime('minx', 9000, is_average=True)
    competition_details.SetQualifyingTime('pyram', 1100, is_average=True)
    competition_details.SetQualifyingTime('skewb', 1100, is_average=True)
    competition_details.SetQualifyingTime('clock', 1300, is_average=True)
    competition_details.SetQualifyingTime('sq1', 3000, is_average=True)
    competition_details.SetQualifyingTime('333ft', 4500, is_average=True)
    competition_details.SetQualifyingTime('333bf', 18000, is_average=False)
    competition_details.SetQualifyingTime('444bf', 60000, is_average=False)
    competition_details.SetQualifyingTime('555bf', 120000, is_average=False)
    # Multi blind qualifying standard is 7 points.  Format is documented here:
    # https://www.worldcubeassociation.org/results/misc/export.html
    competition_details.SetQualifyingTime('333mbf', 929999999, is_average=False)
    
    self.response.write(template.render({
        'c': common.Common(self),
        'competition': self.competition,
        'competition_details': competition_details,
    }))
