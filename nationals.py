import webapp2

from src import config
from src import handlers
from src.handlers.basic import BasicHandler
from src.handlers.contact import ContactHandler

uri_base = '/nationals/2018'
template_base = 'nationals/2018'

app = webapp2.WSGIApplication([
  webapp2.Route('/nationals', webapp2.RedirectHandler, defaults={'_uri': '/nationals/2018'}),
  webapp2.Route('/nationals/2018',
                handler=BasicHandler('/nationals/2018/index.html',
                                     include_wca_disclaimer=True)),
  webapp2.Route('/nationals/2018/events',
                handler=BasicHandler('/nationals/2018/events.html'),
                name='events'),
  webapp2.Route('/nationals/2018/schedule',
                handler=BasicHandler('/nationals/2018/schedule.html')),
  webapp2.Route('/nationals/2018/travel',
                handler=BasicHandler('/nationals/2018/travel.html')),
  webapp2.Route('/nationals/2018/sponsors',
                handler=BasicHandler('/nationals/2018/sponsors.html')),
  webapp2.Route('/nationals/2018/contact',
                handler=ContactHandler('nats-organizers@cubingusa.org',
                                       '/nationals/2018/contact.html',
                                       'Nationals 2018')),
], config=config.GetAppConfig())
