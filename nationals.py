import webapp2

from src import config
from src import handlers
from src.handlers.basic import BasicHandler
from src.handlers.contact import ContactHandler
from src.models.user import Roles
from src.handlers.nationals.eighteen.events import Events2018Handler
from src.handlers.nationals.eighteen.groups import Groups2018Handler
from src.handlers.nationals.eighteen.schedule import Schedule2018Handler
from src.handlers.nationals.nineteen.events import Events2019Handler

app = webapp2.WSGIApplication([
  webapp2.Route('/nationals', webapp2.RedirectHandler, defaults={'_uri': '/nationals/2019'}),
  # 2018
  webapp2.Route('/nationals/2018',
                handler=BasicHandler('/nationals/2018/index.html',
                                     include_wca_disclaimer=True)),
  webapp2.Route('/nationals/2018/events', handler=Events2018Handler,
                name='events_2018'),
  webapp2.Route('/nationals/2018/schedule', handler=Schedule2018Handler),
  webapp2.Route('/nationals/2018/travel',
                handler=BasicHandler('/nationals/2018/travel.html')),
  webapp2.Route('/nationals/2018/unofficial',
                handler=BasicHandler('/nationals/2018/unofficial.html')),
  webapp2.Route('/nationals/2018/contact',
                handler=ContactHandler('nats-organizers@cubingusa.org',
                                       '/nationals/2018/contact.html',
                                       'Nationals 2018')),
  webapp2.Route('/nationals/2018/groups', handler=Groups2018Handler,
                name='groups_2018'),
  webapp2.Route('/nationals/2018/groups/<person_id:\d\d\d\d\w\w\w\w\d\d>',
                handler=Groups2018Handler, name='groups_2018_person'),
  webapp2.Route('/nationals/2018/groups/<event_id:.*>/<round_num:\d>/<stage:.>/<group:\d*>',
                handler=Groups2018Handler, name='groups_2018_group'),
  # 2019
  webapp2.Route('/nationals/2019',
                handler=BasicHandler('/nationals/2019/index.html',
                                     include_wca_disclaimer=True)),
  webapp2.Route('/nationals/2019/events', handler=Events2019Handler,
                name='events_2019'),
  webapp2.Route('/nationals/2019/schedule',
                handler=BasicHandler('/nationals/2019/schedule.html')),
  webapp2.Route('/nationals/2019/travel',
                handler=BasicHandler('/nationals/2019/travel.html')),
  webapp2.Route('/nationals/2019/contact',
                handler=ContactHandler('nats-organizers@cubingusa.org',
                                       '/nationals/2019/contact.html',
                                       'Nationals 2019')),
  webapp2.Route('/nationals/2019/unofficial',
                handler=BasicHandler('/nationals/2019/unofficial.html')),
], config=config.GetAppConfig())
