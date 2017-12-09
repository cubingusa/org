import collections
import webapp2

from src import common
from src.handlers.admin.admin_base import AdminBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.scheduling.staff import ScheduleStaff
from src.models.scheduling.staff import StaffRoles
from src.models.user import Roles


class SchedulingIndexHandler(AdminBaseHandler):
  def get(self):
    editable_competitions = [
        staff.competition.get() for staff in ScheduleStaff.query(
                                                 ScheduleStaff.user == self.user.key).iter()
        if StaffRoles.EDITOR in staff.roles]

    template = JINJA_ENVIRONMENT.get_template('scheduling/index.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'editable_competitions': editable_competitions,
        'unknown_competition': self.request.get('unknown'),
    }))

  def PermittedRoles(self):
    return Roles.AdminRoles() + Roles.DelegateRoles()
