import webapp2

from src import config
from src import handlers
from src.handlers.async.champions_table import ChampionsTableHandler
from src.handlers.async.state_rankings import StateRankingsHandler
from src.handlers.admin.edit_users import EditUsersHandler
from src.handlers.admin.regenerate_refresh_tokens import RegenerateRefreshTokensHandler
from src.handlers.championship_psych import ChampionshipPsychHandler
from src.handlers.championship_psych import ChampionshipPsychAsyncHandler
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
  webapp2.Route('/authenticate', handler=AuthenticateHandler),
  webapp2.Route('/oauth_callback', handler=OAuthCallbackHandler),
  webapp2.Route('/login', handler=LoginHandler, name='login'),
  webapp2.Route('/login_callback', handler=LoginCallbackHandler, name='login_callback'),
  webapp2.Route('/logout', handler=LogoutHandler, name='logout'),
  webapp2.Route('/edit', handler=EditUserHandler, name='edit_user'),
  webapp2.Route('/edit/<user_id:.*>', handler=EditUserHandler, name='edit_user_by_id'),
  webapp2.Route('/regional', handler=RegionalsHandler, name='competitions_regional'),
  webapp2.Route('/regional/psych/<region_or_state:..?>/<year:\d*>',
                handler=ChampionshipPsychHandler, name='regional_psych'),
  # Async
  webapp2.Route('/async/champions_by_year/<event_id:.*>/<championship_type:.*>/<championship_region:.*>',
                handler=ChampionsTableHandler),
  webapp2.Route('/async/champions_by_region/<event_id:.*>/<championship_type:.*>/<year:\d*>',
                handler=ChampionsTableHandler),
  webapp2.Route('/async/state_rankings/<event_id:.*>/<state_id:.*>/<use_average:\d>',
                handler=StateRankingsHandler),
  webapp2.Route('/async/championship_psych/<championship_id:.*>/<event_id:.*>',
                handler=ChampionshipPsychAsyncHandler),
  # Admin
  webapp2.Route('/admin/edit_users',
                handler=BasicHandler('admin/edit_users.html',
                                     permitted_roles=Roles.AllRoles()),
                name='admin_edit_users'),
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
  webapp2.Route('/admin/regenerate_refresh_tokens', handler=RegenerateRefreshTokensHandler),
], config=config.GetAppConfig())
