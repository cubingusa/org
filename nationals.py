import webapp2

from src import config
from src import handlers
from src.handlers.basic import BasicHandler
from src.models.user import Roles

uri_base = '/nationals/2018'
template_base = 'nationals/2018'

app = webapp2.WSGIApplication([
  webapp2.Route('/nationals', webapp2.RedirectHandler, defaults={'_uri': '/nationals/2018'}),
  webapp2.Route('/nationals/2018',
                handler=BasicHandler('/nationals/2018/index.html',
                                     include_wca_disclaimer=True),
                name='index'),
  webapp2.Route('/nationals/2018/events',
                handler=BasicHandler('/nationals/2018/events.html'),
                name='events'),
], config=config.GetAppConfig())
