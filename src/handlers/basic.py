from src import common
from src.handlers.base import BaseHandler
from src.jinja import JINJA_ENVIRONMENT

# A mostly-static handler that renders a given template name.
def BasicHandler(template_path, permitted_roles=[], include_wca_disclaimer=False):
  class Handler(BaseHandler):
    def get(self):
      template = JINJA_ENVIRONMENT.get_template(template_path)
      self.response.write(template.render({
          'c': common.Common(self),
      }))

    def RequireAuth(self):
      return len(permitted_roles) > 0

    def PermittedRoles(self):
      return permitted_roles

    def IncludeWcaDisclaimer(self):
      return include_wca_disclaimer

  return Handler
