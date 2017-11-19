import webapp2

from src import config
from src.handlers.admin.assign_role import AssignRoleHandler
from src.handlers.admin.set_app_settings import SetAppSettingsHandler
from src.handlers.admin.post_import_mutations import PostImportMutationsHandler
from src.handlers.admin.update_championships import UpdateChampionshipsHandler
from src.handlers.admin.update_states import UpdateStatesHandler
from src.handlers.admin.upload_users import UploadUsersHandler
from src.handlers.admin.get_wca_export import GetExportHandler
from src.handlers.admin.app_settings import AppSettingsHandler

app = webapp2.WSGIApplication([
  webapp2.Route('/post_import_mutations', handler=PostImportMutationsHandler),
  webapp2.Route('/update_championships', handler=UpdateChampionshipsHandler),
  webapp2.Route('/update_states', handler=UpdateStatesHandler),
  webapp2.Route('/upload_users', handler=UploadUsersHandler, name='upload_users'),
  webapp2.Route('/wca/get_export', handler=GetExportHandler),
  webapp2.Route('/assign_role/<user_id:\d+>/<role:.*>', handler=AssignRoleHandler),
  webapp2.Route('/set_app_settings/<setting:.*>/<value:.*>', handler=SetAppSettingsHandler),
  webapp2.Route('/app_settings', handler=AppSettingsHandler, name='app_settings'),
], config=config.GetAppConfig())
