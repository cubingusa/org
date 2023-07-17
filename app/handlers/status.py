import datetime
import os
import requests

from flask import Blueprint, request, abort, render_template, redirect
from google.cloud import ndb
import pytz

from app.lib import auth
from app.lib.common import Common
from app.models.status import GroupStatus, CompetitionMetadata
from app.models.wca.competition import Competition
from app.models.wca.event import Event

bp = Blueprint('status', __name__, url_prefix='/status')
client = ndb.Client()
ZERO = datetime.datetime.utcfromtimestamp(0).astimezone(pytz.timezone('UTC'))

events = {
  '333': '3x3x3 Cube',
  '222': '2x2x2 Cube',
  '444': '4x4x4 Cube',
  '555': '5x5x5 Cube',
  '666': '6x6x6 Cube',
  '777': '7x7x7 Cube',
  '333bf': '3x3x3 Blindfolded',
  '333fm': '3x3x3 Fewest Moves',
  '333oh': '3x3x3 One-Handed',
  'clock': 'Clock',
  'minx': 'Megaminx',
  'pyram': 'Pyraminx',
  'skewb': 'Skewb',
  'sq1': 'Square-1',
  '444bf': '4x4x4 Blindfolded',
  '555bf': '5x5x5 Blindfolded',
  '333mbf': '3x3x3 Multi-Blind',
}

def get_metadata(data):
  metadata = CompetitionMetadata.get_by_id(data['id']) or CompetitionMetadata()
  return {
    'delayMinutes': metadata.delay_minutes,
    'message': metadata.message or 'Welcome to ' + data['name'] + '!',
    'refreshTs': int((metadata.refresh_ts or ZERO).timestamp()),
    'imageUrl': metadata.image_url or '/static/img/nats-logo-2023.png',
    'timezone': data['schedule']['venues'][0]['timezone'],
  }

def proj(competition_id):
  return 'projector-' + competition_id

def adm(competition_id):
  return 'admin-' + competition_id


def parse_time(time, data):
  date = datetime.datetime.fromisoformat(time).astimezone(pytz.timezone(data['schedule']['venues'][0]['timezone']))
  if date.minute % 5 in (1, 2):
    date -= datetime.timedelta(minutes=date.minute % 5)
  elif date.minute % 5 in (3, 4):
    date += datetime.timedelta(minutes=5-(date.minute % 5))
  return date

def comp_data(competition_id):
  data = requests.get('https://api.worldcubeassociation.org/competitions/' + competition_id + '/wcif/public')
  if data.status_code != 200:
    abort(data.status_code)
  out = data.json()
  for room in out['schedule']['venues'][0]['rooms']:
    for activity in room['activities']:
      activity['startTime'] = parse_time(activity['startTime'], out)
      activity['endTime'] = parse_time(activity['endTime'], out)
      for child_activity in activity['childActivities']:
        child_activity['startTime'] = parse_time(child_activity['startTime'], out)
        child_activity['endTime'] = parse_time(child_activity['endTime'], out)
  return out

def is_admin(data):
  me = auth.user()
  if not me:
    return False
  for person in data['persons']:
    if int(person['wcaUserId']) == int(me.key.id()):
      return 'delegate' in person['roles'] or 'organizer' in person['roles']
  return False

class ActivityCode:
  def __init__(self, activity):
    code_spl = activity['activityCode'].split('-')
    if (code_spl[0] == 'other'):
      self.is_other = True
      self.name = activity['name']
      return
    self.is_other = False
    self.event_id = code_spl[0]
    self.round = None
    self.group = None
    self.attempt = None
    for subcode in code_spl[1:]:
      if subcode[0] == 'r':
        self.round = int(subcode[1:])
      elif subcode[0] == 'g':
        self.group = int(subcode[1:])
      elif subcode[0] == 'a':
        self.attempt = int(subcode[1:])

  def str(self):
    if self.is_other:
      return self.name
    else:
      parts = [events[self.event_id]]
      if self.round is not None:
        parts += ['Round %d' % self.round]
      if self.group is not None:
        parts += ['Group %d' % self.group]
      if self.attempt is not None:
        parts += ['Attempt %d' % self.attempt]
      return ' '.join(parts)

def call_details(stage_to_activity, status_by_id):
  out = []
  for stage, activity in stage_to_activity.items():
    val = {'stageId': stage, 'activityId': activity['id']}
    if activity['id'] in status_by_id:
      status = status_by_id[activity['id']]
      if status.ready_time:
        val['readyAt'] = status.ready_time.timestamp()
        val['readyBy'] = status.ready_set_by.get().name
      if status.called_time:
        val['calledAt'] = status.called_time.timestamp()
        val['calledBy'] = status.called_by.get().name
    out += [val]
  return out

@bp.route('/<competition_id>/payload')
def payload(competition_id):
  with client.context():
    data = comp_data(competition_id)
    current_time = datetime.datetime.now().astimezone(pytz.timezone(data['schedule']['venues'][0]['timezone']))
    #current_time = pytz.timezone(data['schedule']['venues'][0]['timezone']).localize(datetime.datetime(2023,7,27,9,45))

    group_status = GroupStatus.query(GroupStatus.competition == ndb.Key(Competition, competition_id)).fetch()
    called_group_ids = set([group.group_id for group in group_status if group.called_by is not None])
    status_by_id = {group.group_id : group for group in group_status}
    last_called = None
    next_called = None
    stages = {}
    for room in data['schedule']['venues'][0]['rooms']:
      stages[room['id']] = {'name': room['name'], 'color': room['color']}
      # Only consider main stages.
      if len(room['activities']) < 20:
        continue
      for activity in room['activities']:
        if activity['startTime'] > current_time + datetime.timedelta(hours=3):
          continue
        for child_activity in activity['childActivities']:
          if child_activity['id'] in called_group_ids:
            if last_called is None or child_activity['startTime'] > last_called['startTime']:
              last_called = child_activity
          else:
            if next_called is None or child_activity['startTime'] < next_called['startTime']:
              next_called = child_activity

    stages_with_current = {}
    stages_with_next = {}

    for room in data['schedule']['venues'][0]['rooms']:
      for activity in room['activities']:
        for child_activity in activity['childActivities']:
          if last_called and child_activity['activityCode'] == last_called['activityCode']:
            stages_with_current[room['id']] = child_activity
          if next_called and child_activity['activityCode'] == next_called['activityCode']:
            stages_with_next[room['id']] = child_activity

    current_by_stage = {}
    next_by_stage = {}
    for room in data['schedule']['venues'][0]['rooms']:
      # Don't consider main stages.
      if len(room['activities']) >= 20:
        continue
      for activity in room['activities']:
        if activity['startTime'] > current_time + datetime.timedelta(hours=3):
          continue
        if activity['startTime'] <= current_time:
          if room['id'] not in current_by_stage:
            current_by_stage[room['id']] = activity
          elif activity['startTime'] > current_by_stage[room['id']]['startTime']:
            current_by_stage[room['id']] = activity
        else:
          if room['id'] not in next_by_stage:
            next_by_stage[room['id']] = activity
          elif activity['startTime'] < next_by_stage[room['id']]['startTime']:
            next_by_stage[room['id']] = activity

    return {
      'stages': stages,
      'currentGroup': ({
        'id': last_called['id'],
        'eventId': ActivityCode(last_called).event_id,
        'name': ActivityCode(last_called).str(),
        'startTime': int(last_called['startTime'].timestamp()),
        'endTime': int(last_called['endTime'].timestamp()),
        'stages': list(stages_with_current.keys()),
        'callDetails': call_details(stages_with_current, status_by_id),
      }) if last_called else {},
      'nextGroup': ({
        'id': next_called['id'],
        'eventId': ActivityCode(next_called).event_id,
        'name': ActivityCode(next_called).str(),
        'startTime': int(next_called['startTime'].timestamp()),
        'endTime': int(next_called['endTime'].timestamp()),
        'stages': list(stages_with_next.keys()),
        'callDetails': call_details(stages_with_next, status_by_id),
      }) if next_called else {},
      'currentByStage': {
        k: {
          'id': activity['id'],
          'activityCode': activity['activityCode'],
          'name': ActivityCode(activity).str(),
          'startTime': int(activity['startTime'].timestamp()),
          'endTime': int(activity['endTime'].timestamp()),
        } for k, activity in current_by_stage.items()
      },
      'nextByStage': {
        k: {
          'id': activity['id'],
          'activityCode': activity['activityCode'],
          'name': ActivityCode(activity).str(),
          'startTime': int(activity['startTime'].timestamp()),
          'endTime': int(activity['endTime'].timestamp()),
        } for k, activity in next_by_stage.items()
      },
      'metadata': get_metadata(data),
    }

@bp.route('/<competition_id>/projector')
def projector(competition_id):
  with client.context():
    return render_template('status/projector.html', c=Common(), competition_id=competition_id)

@bp.route('/<competition_id>/admin')
def comp_admin(competition_id):
  with client.context():
    data = comp_data(competition_id)
    if not is_admin(data):
      return redirect('/login')
    return render_template('status/admin.html', c=Common(), data=data, metadata=get_metadata(data))

@bp.route('/<competition_id>/ready/<group_id>', methods=['POST'])
def ready(competition_id, group_id):
  with client.context():
    group_id = int(group_id)
    data = comp_data(competition_id)
    if not is_admin(data):
      abort(401)
    status_id = GroupStatus.Id(competition_id, group_id)
    status_obj = GroupStatus.get_by_id(status_id)
    if status_obj is None:
      status_obj = GroupStatus(id=status_id)
      status_obj.competition = ndb.Key(Competition, competition_id)
      status_obj.group_id = group_id
    status_obj.ready_time = datetime.datetime.now()
    status_obj.ready_set_by = auth.user().key
    status_obj.put()
    return 'ok', 200

@bp.route('/<competition_id>/call/<group_ids>', methods=['POST'])
def call(competition_id, group_ids):
  with client.context():
    for group_id in group_ids.split(','):
      group_id = int(group_id)
      data = comp_data(competition_id)
      if not is_admin(data):
        abort(401)

      status_id = GroupStatus.Id(competition_id, group_id)
      status_obj = GroupStatus.get_by_id(status_id)
      if status_obj is None:
        status_obj = GroupStatus(id=status_id)
        status_obj.competition = ndb.Key(Competition, competition_id)
        status_obj.group_id = group_id
      status_obj.called_time = datetime.datetime.now()
      status_obj.called_by = auth.user().key
      status_obj.put()
    return 'ok', 200

@bp.route('/<competition_id>/metadata', methods=['POST'])
def post_metadata(competition_id):
  with client.context():
    metadata = CompetitionMetadata.get_by_id(competition_id) or CompetitionMetadata(id=competition_id)
    metadata.message = request.form.get('message')
    metadata.delay_minutes = int(request.form.get('delay-minutes'))
    metadata.image_url = request.form.get('image-url')
    if request.form.get('refresh') == '1':
      metadata.refresh_ts = datetime.datetime.now()
    metadata.put()
    return redirect('/status/' + competition_id + '/admin')
