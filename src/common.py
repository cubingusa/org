import datetime
import webapp2

from src import formatters
from src.models.region import Region
from src.models.state import State
from src.models.user import Roles
from src.models.wca.event import Event

class Common(object):
  def __init__(self, handler):
    self.uri_for = webapp2.uri_for
    self.uri = handler.request.url
    self.user = handler.user
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

  def format_date_range(self, start_date, end_date, include_year=True):
    year_chunk = ', %d' % start_date.year if include_year else ''
    if start_date == end_date:
      return '%s %d%s' % (start_date.strftime('%b'), start_date.day, year_chunk)
    elif start_date.month == end_date.month:
      return '%s %d &ndash; %d%s' % (start_date.strftime('%b'), start_date.day,
                                     end_date.day, year_chunk)
    else:
      return '%s %d &ndash; %s %d%s' % (start_date.strftime('%b'), start_date.day,
                                        end_date.strftime('%b'), end_date.day,
                                        year_chunk)

  def sort_events(self, events):
    return sorted(events, key=lambda evt: evt.get().rank)

  def all_states(self):
    return [state for state in State.query().order(State.name).iter()]

  def regions(self):
    return [r for r in Region.query().order(Region.name).iter()]

  def events(self, include_obsolete):
    return [e for e in Event.query().order(Event.rank).iter()
            if include_obsolete or e.key.id() not in ['333mbo', 'magic', 'mmagic']]

  def years(self):
    return reversed(range(2004, datetime.date.today().year + 2))

  def format_date(self, date):
    return '%s %d, %d' % (date.strftime('%B'), date.day, date.year)

  def is_string(self, h):
    return type(h) is str

  def get_nav_items(self):
    items = [('Home', 'home'),
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
    if self.user and self.user.HasAnyRole(Roles.AdminRoles()):
      admin_list = [('Edit Users', 'admin_edit_users')]
      items.append(('Admin', admin_list))
    return items

  def get_right_nav_items(self):
    if self.user:
      return [('My Settings', 'edit_user'),
              ('Log out', 'logout')]
    else:
      return [('Log in with WCA', 'login')]
