import webapp2

from src.handlers import admin

app = webapp2.WSGIApplication([
  webapp2.Route('/admin/update_states', handler=admin.UpdateStatesHandler),
  webapp2.Route('/admin/wca/get_export', handler=admin.GetExportHandler),
])
