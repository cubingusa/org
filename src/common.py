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

  def uri_matches(self, uri):
    return self.uri.endswith(uri)

  def uri_matches_any(self, uri_list):
    for text, uri in uri_list:
      if self.uri_matches(uri):
        return True
    return False

  def wca_profile(self, wca_id):
    return 'https://www.worldcubeassociation.org/persons/%s' % wca_id

  def format_date_range(self, start_date, end_date):
    if start_date == end_date:
      return '%s %d, %d' % (start_date.strftime('%b'), start_date.day, start_date.year)
    elif start_date.month == end_date.month:
      return '%s %d &ndash; %d, %d' % (start_date.strftime('%b'), start_date.day,
                                       end_date.day, start_date.year)
    else:
      return '%s %d &ndash; %s %d, %d' % (start_date.strftime('%b'), start_date.day,
                                          end_date.strftime('%b'), end_date.day,
                                          start_date.year)

  def sort_events(self, events):
    return sorted(events, key=lambda evt: evt.get().rank)

  def all_states(self):
    return [state for state in State.query().order(State.name).iter()]
