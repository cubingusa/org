import webapp2

from src import config
from src import handlers
from src.handlers import async

app = webapp2.WSGIApplication([
  webapp2.Route('/', handler=handlers.BasicHandler('index.html'), name='home'),
  webapp2.Route('/login', handler=handlers.LoginHandler, name='login'),
  webapp2.Route('/login_callback', handler=handlers.LoginCallbackHandler, name='login_callback'),
  webapp2.Route('/logout', handler=handlers.LogoutHandler, name='logout'),
  webapp2.Route('/edit', handler=handlers.EditUserHandler, name='edit_user'),
  webapp2.Route('/edit/<user_id:\d+>', handler=handlers.EditUserHandler, name='edit_user_by_id'),
  webapp2.Route('/competitions/us', handler=handlers.BasicHandler('index.html'), name='competitions_us'),
  webapp2.Route('/nationals', handler=handlers.BasicHandler('nationals.html'), name='competitions_nationals'),
  webapp2.Route('/regional', handler=handlers.BasicHandler('index.html'), name='competitions_regional'),
  webapp2.Route('/organizers', handler=handlers.BasicHandler('index.html'), name='organizers'),
  webapp2.Route('/about', handler=handlers.BasicHandler('about.html'), name='about'),
  webapp2.Route('/about/why', handler=handlers.BasicHandler('index.html'), name='about_why'),
  webapp2.Route('/about/who', handler=handlers.BasicHandler('about_who.html'), name='about_who'),
  webapp2.Route('/about/donations', handler=handlers.BasicHandler('donations.html'), name='about_donations'),
  webapp2.Route('/contact', handler=handlers.BasicHandler('index.html'), name='contact'),
  webapp2.Route('/async/champions_by_year/<event_id:.*>/<championship_type:.*>/<championship_region:.*>',
                handler=async.ChampionsByYearHandler)
], config=config.GetAppConfig())
