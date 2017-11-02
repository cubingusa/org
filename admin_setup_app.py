import webapp2

from src import config
from src.handlers.admin.assign_role import AssignRoleHandler
from src.handlers.admin.set_app_settings import SetAppSettingsHandler

app = webapp2.WSGIApplication([
  webapp2.Route('/setup/assign_role/<user_id:\d+>/<role:.*>', handler=AssignRoleHandler),
  webapp2.Route('/setup/set_app_settings/<setting:.*>/<value:.*>', handler=SetAppSettingsHandler),
], config=config.GetAppConfig())
