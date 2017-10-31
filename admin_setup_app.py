import webapp2

from src import config
from src.handlers import admin

app = webapp2.WSGIApplication([
  webapp2.Route('/admin/assign_role/<user_id:\d+>/<role:.*>', handler=admin.AssignRoleHandler),
  webapp2.Route('/admin/set_app_settings/<setting:.*>/<value:.*>',
                handler=admin.SetAppSettingsHandler),
], config=config.GetAppConfig())
