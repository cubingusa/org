import webapp2

from src import config
from src.handlers.admin.get_wca_export import GetExportHandler
from src.handlers.admin.post_import_mutations import PostImportMutationsHandler
from src.handlers.admin.update_championships import UpdateChampionshipsHandler
from src.handlers.admin.update_states import UpdateStatesHandler

app = webapp2.WSGIApplication([
  webapp2.Route('/admin/post_import_mutations', handler=PostImportMutationsHandler),
  webapp2.Route('/admin/update_championships', handler=UpdateChampionshipsHandler),
  webapp2.Route('/admin/update_states', handler=UpdateStatesHandler),
  webapp2.Route('/admin/wca/get_export', handler=GetExportHandler),
], config=config.GetAppConfig())
