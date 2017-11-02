import webapp2

from src import config
from src.handlers.admin.get_wca_export import GetExportHandler
from src.handlers.admin.post_import_mutations import PostImportMutationsHandler
from src.handlers.admin.update_championships import UpdateChampionshipsHandler
from src.handlers.admin.update_states import UpdateStatesHandler
from src.handlers.login import LoginHandler
from src.handlers.login import LoginCallbackHandler
from src.handlers.login import LogoutHandler

app = webapp2.WSGIApplication([
  webapp2.Route('/login', handler=LoginHandler, name='login'),
  webapp2.Route('/login_callback', handler=LoginCallbackHandler, name='login_callback'),
  webapp2.Route('/logout', handler=LogoutHandler, name='logout'),
  webapp2.Route('/post_import_mutations', handler=PostImportMutationsHandler),
  webapp2.Route('/update_championships', handler=UpdateChampionshipsHandler),
  webapp2.Route('/update_states', handler=UpdateStatesHandler),
  webapp2.Route('/wca/get_export', handler=GetExportHandler),
], config=config.GetAppConfig())
