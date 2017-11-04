import webapp2

from src import formatters
from src.models.state import State
from src.models.wca.event import Event

class Common(object):
  def __init__(self, handler):
    self.uri_for = webapp2.uri_for
    self.uri = handler.request.url
    self.user = handler.user
    self.events = [e for e in Event.query().order(Event.rank).iter()]
    self.len = len
    self.formatters = formatters

  def uri_matches(self, handler_name):
    return self.uri.endswith(self.uri_for(handler_name))

  def uri_matches_any(self, handler_list):
    for text, handler_name in handler_list:
      if self.uri_matches(handler_name):
        return True
    return False

  def wca_profile(self, wca_id):
    return 'https://www.worldcubeassociation.org/persons/%s' % wca_id

  def all_states(self):
    return [state for state in State.query().order(State.name).iter()]

  def format_date(self, date):
    return '%s %d, %d' % (date.strftime('%B'), date.day, datetime.year)

  def is_string(self, h):
    return type(h) is str

  def get_nav_items(self):
    return [('Home', 'home'),
            ('Competitions', [
                ('US Competitions', 'competitions_us'),
                ('Nationals', 'competitions_nationals'),
                ('Regional Championships', 'competitions_regional'),
            ]),
            ('Organizers', 'organizers'),
            ('About', [
                ('About CubingUSA', 'about'),
                ('Who we are', 'about_who'),
                ('Donations', 'about_donations'),
                ('Public Documents', 'documents'),
            ]),
           ]

  def get_right_nav_items(self):
    if self.user:
      return [('My Settings', 'edit_user'),
              ('Log out', 'logout')]
    else:
      return [('Log in with WCA', 'login')]
