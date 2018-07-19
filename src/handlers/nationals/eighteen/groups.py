import json

from google.appengine.api import urlfetch

from src import common
from src.handlers.base import BaseHandler
from src.jinja import JINJA_ENVIRONMENT


SCHEDULING_BASE_PATH='https://usnationals2018.appspot.com'


class Formatters:
  @staticmethod
  def format_time(time_dict):
    return '%d:%02d' % (time_dict['hour'], time_dict['minute'])

  @staticmethod
  def format_day_of_week(day_of_week_int):
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day_of_week_int]


class Groups2018Handler(BaseHandler):
  def get(self, person_id='', event_id='', round_num='', stage='', group_num=''):
    # Common stuff: get a list of all competitors.
    error_template = JINJA_ENVIRONMENT.get_template('error.html')
    template = JINJA_ENVIRONMENT.get_template('nationals/2018/groups.html')

    try:
      result = urlfetch.fetch(SCHEDULING_BASE_PATH + '/get_competitors')
    except urlfetch.Error as e:
      self.response.write(error_template.render({
          'c': common.Common(self),
          'error': 'Failed to load list of competitors!'}))
      logging.error(str(e))
      return

    competitors = json.loads(result.content)
    competitors.sort(key=lambda c: c['name'])
    competitors_by_id = {c['wca_id'] : c for c in competitors}

    # If the person is logged in, redirect them to their groups.
    if not person_id and self.user and self.user.wca_person and self.user.wca_person.id() in competitors_by_id:
      self.redirect_to('groups_2018_person', person_id=self.user.wca_person.id())
      return

    if person_id and person_id in competitors_by_id:
      person = competitors_by_id[person_id]
      try:
        result = urlfetch.fetch(SCHEDULING_BASE_PATH + '/get_schedule/' + person['id'])
      except urlfetch.Error as e:
        self.response.write(error_template.render({
            'c': common.Common(self),
            'error': 'Failed to load schedule!'}))
        logging.error(str(e))
        return
      schedule = json.loads(result.content)
      self.response.write(template.render({
          'c': common.Common(self),
          'f': Formatters,
          'competitors': competitors,
          'active_competitor': person,
          'schedule': schedule['groups'],
      }))
      return

    if event_id and round_num and stage and group_num:
      try:
        result = urlfetch.fetch(SCHEDULING_BASE_PATH +
                                '/get_group_info/%s/%s/%s/%s' %
                                    (event_id, round_num, stage, group_num))
      except urlfetch.Error as e:
        self.response.write(error_template.render({
            'c': common.Common(self),
            'error': 'Failed to load schedule!'}))
        logging.error(str(e))
        return
      group = json.loads(result.content)
      self.response.write(template.render({
          'c': common.Common(self),
          'f': Formatters,
          'competitors': competitors,
          'group': group,
      }))
      return
    self.response.write(template.render({
        'c': common.Common(self),
        'f': Formatters,
        'competitors': competitors,
    }))
