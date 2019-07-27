from src.handlers.base import BaseHandler


class NationalsGroupsRedirectHandler(BaseHandler):
  def get(self, person_id):
    self.redirect('/nationals/2019/groups/' + person_id)
