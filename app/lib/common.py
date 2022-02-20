import datetime
import os

from flask import request
from google.cloud import ndb

from app.lib import auth
from app.lib import formatters
from app.lib import secrets
from app.models.region import Region
from app.models.state import State
from app.models.user import Roles

class Common(object):
  
  current_date = datetime.datetime.now()
  
  def __init__(self):
    self.uri = request.path
    self.len = len
    self.formatters = formatters
    self.year = datetime.date.today().year
    self.user = auth.user()

  def uri_matches(self, path):
    return self.uri.endswith(path)

  def uri_matches_any(self, path_list):
    for text, path in path_list:
      if self.uri_matches(path):
        return True
    return False

  def wca_profile(self, wca_id):
    return 'https://www.worldcubeassociation.org/persons/%s' % wca_id

  def format_date_range(self, start_date, end_date, include_year=True, full_months=False):
    year_chunk = ', %d' % start_date.year if include_year else ''
    month_format = lambda date: date.strftime('%B' if full_months else '%b')
    if start_date == end_date:
      return '%s %d%s' % (month_format(start_date), start_date.day, year_chunk)
    elif start_date.month == end_date.month:
      return '%s %d &ndash; %d%s' % (month_format(start_date), start_date.day,
                                     end_date.day, year_chunk)
    else:
      return '%s %d &ndash; %s %d%s' % (month_format(start_date), start_date.day,
                                        month_format(end_date), end_date.day,
                                        year_chunk)

  def sort_events(self, events):
    return sorted(events, key=lambda evt: evt.get().rank)

  def all_states(self):
    return [state for state in State.query().order(State.name).iter()]

  def regions(self):
    return [r for r in Region.query().order(Region.name).iter()]

  def years(self):
    return reversed(range(2004, datetime.date.today().year + 2))

  def format_date(self, date):
    return '%s %d, %d' % (date.strftime('%B'), date.day, date.year)

  def is_string(self, h):
    return type(h) is str

  def is_none(self, h):
    return h is None

  def get_nav_items(self):
    items = [('Home', '/'),
             ('Competitions', [
                 ('Nationals', '/nationals'),
                 ('Regional Championships', '/regional'),
             ]),
             ('Competitors', [
                 ('State Rankings', '/state_rankings'),
             ]),
             ('Organizers', [
                 ('CubingUSA Supported Competitions', '/supported'),
                 ('WCA Organizer Guidelines', 'https://www.worldcubeassociation.org/organizer-guidelines'),
             ]),
             ('About', [
                 ('About CubingUSA', '/about'),
                 ('Who we are', '/about/who'),
                 ('Donations', '/about/donations'),
                 ('Contact Us', '/about/contact'),
                 ('Logo', '/about/logo'),
                 ('Public Documents', '/about/documents'),
             ]),
            ]
    if self.user and self.user.HasAnyRole(Roles.AdminRoles()):
      items += [('Admin', [
                    ('Edit Users', '/admin/edit_users'),
                ])]
    return items

  def get_right_nav_items(self):
    if self.user:
      return [('My Settings', '/edit'),
              ('Log out', '/logout')]
    else:
      return [('Log in', '/login')]

  def is_prod(self):
    return os.environ['ENV'] == 'PROD'

  def IconUrl(self, event_id):
    return '/static/img/events/%s.svg' % event_id

  def get_secret(self, name):
    return secrets.get_secret(name)
