import webapp2

from src import config
from src.handlers import admin

app = webapp2.WSGIApplication([
  webapp2.Route('/admin/post_import_mutations', handler=admin.PostImportMutationsHandler),
  webapp2.Route('/admin/update_championships', handler=admin.UpdateChampionshipsHandler),
  webapp2.Route('/admin/update_states', handler=admin.UpdateStatesHandler),
  webapp2.Route('/admin/wca/get_export', handler=admin.GetExportHandler),
], config=config.GetAppConfig())
