import json

from google.appengine.api import urlfetch
from google.appengine.ext import ndb

from src import common
from src.handlers.base import BaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.wca.event import Event
from src.models.wca.rank import RankAverage
from src.models.wca.rank import RankSingle


SCHEDULING_BASE_PATH='https://usnationals2018.appspot.com'


class Formatters:
  @staticmethod
  def format_time(time_dict):
    return '%d:%02d' % (time_dict['hour'], time_dict['minute'])

  @staticmethod
  def format_day_of_week(day_of_week_int):
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day_of_week_int]

  @staticmethod
  def format_event_round(round_dict):
    if round_dict['event']['id'] in ('333mbf', '333fm'):
      return '%s Attempt %d' % (round_dict['event']['name'], round_dict['number'])
    if round_dict['is_final']:
      return '%s Final' % round_dict['event']['name']
    return '%s Round %d' % (round_dict['event']['name'], round_dict['number'])
      


class Groups2018Handler(BaseHandler):
  def get(self, person_id='', event_id='', round_num='', stage='', group=''):
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
    if not person_id and self.user and self.user.wca_person and self.user.wca_person.id() in competitors_by_id and not event_id:
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

    if event_id and round_num and stage and group:
      try:
        result = urlfetch.fetch(SCHEDULING_BASE_PATH +
                                '/get_group_info/%s/%s/%s/%s' %
                                    (event_id, round_num, stage, group))
      except urlfetch.Error as e:
        self.response.write(error_template.render({
            'c': common.Common(self),
            'error': 'Failed to load schedule!'}))
        logging.error(str(e))
        return
      group = json.loads(result.content)
      event_key = ndb.Key(Event, event_id)

      rank_class = RankSingle if 'bf' in event_id else RankAverage
      rank_keys = [ndb.Key(rank_class, '%s_%s' % (competitor['wca_id'], event_id))
                   for competitor in group['competitors']]
      ranks = ndb.get_multi(rank_keys)
      seed_times = {rank.key.id()[:rank.key.id().find('_')] : rank for rank in ranks if rank}

      judges = [{}] * 10
      scramblers = []
      runners = []
      for staff_assignment in group['staff']:
        job = staff_assignment['job']
        if job == 'J':
          judges[staff_assignment['station'] - 1] = staff_assignment['staff_member']
        elif job == 'R':
          runners.append(staff_assignment['staff_member'])
        elif job == 'S':
          scramblers.append(staff_assignment['staff_member'])

      self.response.write(template.render({
          'c': common.Common(self),
          'f': Formatters,
          'competitors': competitors,
          'group': group,
          'event_key': event_key,
          'seed_times': seed_times,
          'judges': judges,
          'scramblers': scramblers,
          'runners': runners,
      }))
      return
    self.response.write(template.render({
        'c': common.Common(self),
        'f': Formatters,
        'competitors': competitors,
    }))
