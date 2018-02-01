import webapp2

from src import config
from src import handlers
from src.handlers.async.champions_by_year import ChampionsByYearHandler
from src.handlers.async.state_rankings import StateRankingsHandler
from src.handlers.basic import BasicHandler
from src.handlers.contact import ContactHandler
from src.handlers.documents import DocumentsHandler
from src.handlers.documents import GetDocumentHandler
from src.handlers.admin.documents import DeleteDocumentHandler
from src.handlers.admin.documents import PermanentlyDeleteDocumentsHandler
from src.handlers.admin.documents import RestoreDocumentHandler
from src.handlers.admin.documents import UploadDocumentHandler
from src.handlers.admin.edit_championships import AddChampionshipHandler
from src.handlers.admin.edit_championships import DeleteChampionshipHandler
from src.handlers.admin.edit_championships import EditChampionshipsHandler
from src.handlers.admin.edit_users import EditUsersHandler
from src.handlers.championship_psych import ChampionshipPsychHandler
from src.handlers.edit_user import EditUserHandler
from src.handlers.login import LoginHandler
from src.handlers.login import LoginCallbackHandler
from src.handlers.login import LogoutHandler
from src.handlers.oauth import AuthenticateHandler
from src.handlers.oauth import OAuthCallbackHandler
from src.handlers.regional import RegionalsHandler
from src.models.app_settings import AppSettings
from src.models.user import Roles

app = webapp2.WSGIApplication([
  webapp2.Route('/', handler=BasicHandler('index.html'), name='home'),
  webapp2.Route('/authenticate', handler=AuthenticateHandler),
  webapp2.Route('/oauth_callback', handler=OAuthCallbackHandler),
  webapp2.Route('/login', handler=LoginHandler, name='login'),
  webapp2.Route('/login_callback', handler=LoginCallbackHandler, name='login_callback'),
  webapp2.Route('/logout', handler=LogoutHandler, name='logout'),
  webapp2.Route('/edit', handler=EditUserHandler, name='edit_user'),
  webapp2.Route('/edit/<user_id:.*>', handler=EditUserHandler, name='edit_user_by_id'),
  webapp2.Route('/regional', handler=RegionalsHandler, name='competitions_regional'),
  webapp2.Route('/regional/psych/<region_or_state:..>/<year:\d*>',
                handler=ChampionshipPsychHandler, name='regional_psych'),
  webapp2.Route('/supported', handler=BasicHandler('supported.html'), name='supported'),
  webapp2.Route('/state_rankings', handler=BasicHandler('state_rankings.html', include_wca_disclaimer=True),
                name='state_rankings'),
  webapp2.Route('/about', handler=BasicHandler('about.html'), name='about'),
  webapp2.Route('/about/who', handler=BasicHandler('about_who.html'), name='about_who'),
  webapp2.Route('/about/donations', handler=BasicHandler('donations.html'), name='about_donations'),
  webapp2.Route('/about/documents', handler=DocumentsHandler, name='documents'),
  webapp2.Route('/about/get_document/<document_id:.*>/<document_name:.*>',
                handler=GetDocumentHandler, name='get_document'),
  webapp2.Route('/about/logo', handler=BasicHandler('logo.html'), name='logo'),
  webapp2.Route('/about/contact',
                handler=ContactHandler(AppSettings.Get().contact_email, 'contact.html', 'CubingUSA'),
                name='contact'),
  # Async
  webapp2.Route('/async/champions_by_year/<event_id:.*>/<championship_type:.*>/<championship_region:.*>',
                handler=ChampionsByYearHandler),
  webapp2.Route('/async/state_rankings/<event_id:.*>/<state_id:.*>/<use_average:\d>',
                handler=StateRankingsHandler),
  # Admin
  webapp2.Route('/admin/edit_users',
                handler=BasicHandler('admin/edit_users.html',
                                     permitted_roles=Roles.AllRoles()),
                name='admin_edit_users'),
  webapp2.Route('/admin/upload_document', handler=UploadDocumentHandler,
                name='upload_document'),
  webapp2.Route('/admin/delete_document/<document_id:.*>', handler=DeleteDocumentHandler,
                name='delete_document'),
  webapp2.Route('/admin/restore_document/<document_id:.*>', handler=RestoreDocumentHandler,
                name='restore_document'),
  webapp2.Route('/admin/permanently_delete_documents', handler=PermanentlyDeleteDocumentsHandler),
  webapp2.Route('/admin/edit_championships',
                handler=EditChampionshipsHandler,
                name='edit_championships'),
  webapp2.Route('/admin/delete_championship/<championship_id:.*>',
                handler=DeleteChampionshipHandler,
                name='delete_championship'),
  webapp2.Route('/admin/add_championship/<competition_id:.*>/<championship_type:.*>',
                handler=AddChampionshipHandler,
                name='add_championship'),
  webapp2.Route('/admin/async/get_users/<filter_text:.*>', handler=EditUsersHandler),
], config=config.GetAppConfig())
