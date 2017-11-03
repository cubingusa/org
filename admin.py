import webapp2

from src import config
from src.handlers.admin.documents import DeleteDocumentHandler
from src.handlers.admin.documents import RestoreDocumentHandler
from src.handlers.admin.documents import UploadDocumentHandler
from src.handlers.admin.get_wca_export import GetExportHandler
from src.handlers.admin.post_import_mutations import PostImportMutationsHandler
from src.handlers.admin.update_championships import UpdateChampionshipsHandler
from src.handlers.admin.update_states import UpdateStatesHandler
from src.handlers.documents import DocumentsHandler
from src.handlers.documents import GetDocumentHandler
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
  webapp2.Route('/about/documents', handler=DocumentsHandler, name='documents'),
  webapp2.Route('/about/get_document/<document_id:.*>/<document_name:.*>',
                handler=GetDocumentHandler, name='get_document'),
  webapp2.Route('/about/upload_document', handler=UploadDocumentHandler,
                name='upload_document'),
  webapp2.Route('/about/delete_document/<document_id:.*>', handler=DeleteDocumentHandler,
                name='delete_document'),
  webapp2.Route('/about/restore_document/<document_id:.*>', handler=RestoreDocumentHandler,
                name='restore_document'),
], config=config.GetAppConfig(is_admin=False))
