import webapp2

from src.handlers.admin.admin_base import AdminBaseHandler
from src.models.scheduling.competition import ScheduleCompetition
from src.models.user import Roles


class NewCompetitionHandler(AdminBaseHandler):
  def post(self):
    competition_id = self.request.POST['competitionid']
    existing_competition = ScheduleCompetition.get_by_id(competition_id)
    if existing_competition:
      self.redirect(webapp2.uri_for('index', duplicate=1))
      return
    existing_competition = ScheduleCompetition(id=competition_id)
    existing_competition.editors.append(self.user.key)
    existing_competition.put()
    self.redirect(webapp2.uri_for('edit_competition', competition=competition_id))

  def PermittedRoles(self):
    return Roles.AdminRoles() + Roles.DelegateRoles()
