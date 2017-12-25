import webapp2

from src import config
from src.handlers.admin.app_settings import AppSettingsHandler
from src.handlers.admin.assign_role import AssignRoleHandler
from src.handlers.admin.get_wca_export import GetExportHandler
from src.handlers.admin.copy_user_states import CopyUserStatesHandler
from src.handlers.admin.post_import_mutations import PostImportMutationsHandler
from src.handlers.admin.update_championships import UpdateChampionshipsHandler
from src.handlers.admin.update_states import UpdateStatesHandler
from src.handlers.admin.upload_users import UploadUsersHandler
from src.handlers.basic import BasicHandler
from src.handlers.login import LoginHandler
from src.handlers.login import LoginCallbackHandler
from src.handlers.login import LogoutHandler
from src.handlers.oauth import AuthenticateHandler
from src.handlers.oauth import OAuthCallbackHandler
from src.models.user import Roles

app = webapp2.WSGIApplication([
  webapp2.Route('/', handler=BasicHandler('admin/index.html',
                                          permitted_roles=Roles.AdminRoles())),
  webapp2.Route('/authenticate', handler=AuthenticateHandler),
  webapp2.Route('/oauth_callback', handler=OAuthCallbackHandler),
  webapp2.Route('/copy_user_states', handler=CopyUserStatesHandler),
  webapp2.Route('/login', handler=LoginHandler, name='login'),
  webapp2.Route('/login_callback', handler=LoginCallbackHandler, name='login_callback'),
  webapp2.Route('/logout', handler=LogoutHandler, name='logout'),
  webapp2.Route('/post_import_mutations', handler=PostImportMutationsHandler),
  webapp2.Route('/update_championships', handler=UpdateChampionshipsHandler),
  webapp2.Route('/update_states', handler=UpdateStatesHandler),
  webapp2.Route('/upload_users', handler=UploadUsersHandler, name='upload_users'),
  webapp2.Route('/wca/get_export', handler=GetExportHandler),
  webapp2.Route('/assign_role/<user_id:.*>/<role:.*>', handler=AssignRoleHandler),
  webapp2.Route('/app_settings', handler=AppSettingsHandler, name='app_settings'),
], config=config.GetAppConfig())
