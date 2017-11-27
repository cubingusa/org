import collections
import webapp2

from src import common
from src.handlers.admin.admin_base import AdminBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.scheduling.competition import ScheduleCompetition
from src.models.user import Roles


class SchedulingIndexHandler(AdminBaseHandler):
  def get(self):
    editable_competitions = ScheduleCompetition.query(
        ScheduleCompetition.editors == self.user.key).fetch()

    template = JINJA_ENVIRONMENT.get_template('scheduling/index.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'editable_competitions': editable_competitions,
        'unknown_competition': self.request.get('unknown'),
    }))

  def PermittedRoles(self):
    return Roles.AdminRoles() + Roles.DelegateRoles()
