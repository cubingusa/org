import datetime
import json
import urllib
import webapp2

from google.appengine.ext import ndb

from src.handlers.oauth import OAuthBaseHandler
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.schedule import Schedule
from src.models.wca.event import Event
from src.models.wca.format import Format


class NewScheduleHandler(SchedulingBaseHandler):
  def get(self, competition_id):
    if not self.SetCompetition(competition_id):
      return
    self.redirect('/authenticate?' + urllib.urlencode({
        'scope': 'public email manage_competitions',
        'callback': webapp2.uri_for('new_schedule_callback', _full=True),
        'handler_data': competition_id,
    }))


class NewScheduleCallbackHandler(OAuthBaseHandler, SchedulingBaseHandler):
  def get(self):
    OAuthBaseHandler.get(self)
    if not self.auth_token:
      return

    competition_id = self.handler_data
    if not self.SetCompetition(competition_id):
      return

    response = self.GetWcaApi('/api/v0/competitions/%s/wcif' % competition_id)
    if response.status != 200:
      self.redirect(webapp2.uri_for('index', unknown=1))
      return
    response_json = json.loads(response.read())

    objects_to_put = []
    schedule = Schedule()
    schedule.competition = self.competition.key
    schedule.creation_time = datetime.datetime.now()
    schedule.last_update_time = schedule.creation_time
    schedule.is_live = False
    schedule.put()
    for event in response_json['events']:
      event_key = ndb.Key(Event, event['id'])
      round_num = 0
      next_round_count = 0
      for round_json in event['rounds']:
        round_num += 1
        round_object = ScheduleRound(
            id=ScheduleRound.Id(schedule.key.id(), event['id'], round_num))
        round_object.schedule = schedule.key
        round_object.event = event_key
        round_object.number = round_num
        round_object.is_final = len(event['rounds']) == round_num
        round_object.format = ndb.Key(Format, round_json['format'])
        if round_json['cutoff']:
          round_object.cutoff = round_json['cutoff']['attemptResult']
        if round_json['timeLimit'] and round_json['timeLimit']['centiseconds']:
          round_object.time_limit = round_json['timeLimit']['centiseconds']
        round_object.wcif = json.dumps(round_json)
        if next_round_count:
          round_object.num_competitors = next_round_count

        objects_to_put.append(round_object)
        advancement_condition = round_json['advancementCondition']
        if advancement_condition and advancement_condition['type'] == 'ranking':
          next_round_count = advancement_condition['level']
        else:
          next_round_count = 0

    ndb.put_multi(objects_to_put)
    self.redirect(webapp2.uri_for('edit_schedule',
                                  competition_id=competition_id,
                                  schedule_version=schedule.key.id()))
