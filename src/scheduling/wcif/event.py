import json

from google.appengine.ext import ndb

from src.models.scheduling.group import ScheduleGroup
from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.time_block import ScheduleTimeBlock
from src.models.wca.event import Event
from src.models.wca.format import Format

# Writes an Event in WCIF format.
# https://docs.google.com/document/d/1hnzAZizTH0XyGkSYe-PxFL5xpKVWl_cvSdTzlT_kAs8/edit?ts=5a3fd252#heading=h.1r8gj6odvsk0
def EventToWcif(event_id, rounds):
  output_dict = {}
  output_dict['id'] = event_id
  output_dict['rounds'] = []
  # The CubingUSA scheduling system does not update any data attached to a Round
  # which is specified in the WCIF standard.  We hold a blob of JSON containing
  # the Round in WCIF format, which we pass through here.
  for r in rounds:
    output_dict['rounds'].append(json.loads(r.wcif))
  # TODO: Include competitor limits.
  # TODO: Include qualification times.

  return output_dict

def ImportEvents(wcif_data, schedule_key, entities_to_put, entities_to_delete, errors):
  existing_rounds = {
      e.key.id() : e
      for e in ScheduleRound.query(ScheduleRound.schedule == schedule_key).iter()}

  all_event_ids = set([e.key.id() for e in Event.query().iter()])
  all_formats = set([f.key.id() for f in Format.query().iter()])

  for event in wcif_data['events']:
    if 'id' not in event:
      errors.append('Malformed WCIF: missing \'id\' field for event.')
      continue
    if event['id'] not in all_event_ids:
      errors.append('Unrecognized event ID \'%s\'' % event['id'])
      continue
    event_key = ndb.Key(Event, event['id'])
    round_num = 0
    next_round_count = 0
    for round_json in event['rounds']:
      round_num += 1
      round_id = ScheduleRound.Id(schedule_key.id(), event['id'], round_num)
      if round_id in existing_rounds:
        round_object = existing_rounds[round_id]
        del existing_rounds[round_id]
      else:
        round_object = ScheduleRound(id=round_id)
      round_object.schedule = schedule_key
      round_object.event = event_key
      round_object.number = round_num
      round_object.is_final = len(event['rounds']) == round_num
      if 'format' not in round_json:
        errors.append('Malformed WCIF: missing \'format\' field for %s' % round_id)
        continue
      if round_json['format'] not in all_formats:
        errors.append('Unrecognized format ID \'%s\'' % round_json['format'])
        continue
      round_object.format = ndb.Key(Format, round_json['format'])
      if 'cutoff' in round_json and round_json['cutoff']:
        round_object.cutoff = round_json['cutoff']['attemptResult']
      if ('timeLimit' in round_json and round_json['timeLimit'] and
          'centiseconds' in round_json['timeLimit'] and
          round_json['timeLimit']['centiseconds']):
        round_object.time_limit = round_json['timeLimit']['centiseconds']
      round_object.wcif = json.dumps(round_json)
      if next_round_count:
        round_object.num_competitors = next_round_count

      next_round_count = 0
      if 'advancementCondition' in round_json:
        advancement_condition = round_json['advancementCondition']
        if (advancement_condition and 'type' in advancement_condition and
            advancement_condition['type'] == 'ranking'):
          next_round_count = advancement_condition['level']
      entities_to_put.append(round_object)
  entities_to_delete.extend([r for r in existing_rounds.itervalues()])

  # Also look for time blocks and groups that are now unused.
  for obj_class in (ScheduleTimeBlock, ScheduleGroup):
    for obj in obj_class.query(obj_class.schedule == schedule_key).iter():
      if obj.round.id() in existing_rounds:
        entities_to_delete.append(obj)
