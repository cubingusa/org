import datetime
import random

from google.appengine.ext import ndb

from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.time_block import ScheduleTimeBlock
from src.scheduling.wcif.activity_code import ActivityCode
from src.scheduling.wcif.extensions import AddExtension

# Writes a ScheduleTimeBlock in WCIF format.  A TimeBlock corresponds to an
# Activity in the WCIF spec.
# https://docs.google.com/document/d/1hnzAZizTH0XyGkSYe-PxFL5xpKVWl_cvSdTzlT_kAs8/edit?ts=5a3fd252#heading=h.a8wx47sshf0x
def TimeBlockToWcif(time_block, groups):
  output_dict = {}
  r = time_block.round.get()
  e = r.event.get()
  output_dict['name'] = '%s %s' % (
      e.name, 'Final' if r.is_final else 'Round %d' % r.number)
  activity_code = ActivityCode(event_id=r.event.id(), round_id=r.number,
                               group=None, attempt=time_block.attempt)
  output_dict['activityCode'] = str(activity_code)
  # TODO: This does not currently match the WCIF spec.  Resolve this.
  output_dict['startTime'] = time_block.GetStartTime().isoformat()
  output_dict['endTime'] = time_block.GetEndTime().isoformat()
  # TODO: pending completion of WCIF discussion, add groups as child activities.

  extension_dict = {}
  extension_dict['datastoreId'] = time_block.key.id()
  extension_dict['staffOnly'] = time_block.staff_only
  AddExtension('ScheduleTimeBlock', extension_dict, output_dict)

  return output_dict

def ImportTimeBlock(activity_data, schedule, stage, out, time_blocks, groups):
  if 'activityCode' not in activity_data:
    out.errors.append('activityCode missing from Activity.')
    return
  try:
    activity_code = ActivityCode.ParseCode(activity_data['activityCode'])
  except Exception as e:
    out.errors.append(e.message)
    return

  if activity_code.other_string:
    # TODO: support non-event Activities.
    return

  if not activity_code.event_id:
    out.errors.append('Missing event ID for activity %s' % activity_data['activityCode'])
    return
  if not activity_code.round_id:
    # We ignore Activities that are not specific to a round.
    return

  # TODO: if we have the datastore ID, try to reuse that TimeBlock.
  round_id = ScheduleRound.Id(schedule.key.id(), activity_code.event_id, activity_code.round_id)
  time_block_id = '%s_%d' % (round_id, random.randint(2 ** 4, 2 ** 32))

  time_block = ScheduleTimeBlock(id=time_block_id)
  time_block.schedule = schedule.key
  time_block.round = ndb.Key(ScheduleRound, round_id)
  time_block.stage = stage.key
  # TODO: include beginning and ending time.
  time_block.start_time = datetime.datetime(2018, 1, 1, 8, 0, 0)
  time_block.end_time = datetime.datetime(2018, 1, 1, 9, 0, 0)
  out.entities_to_put.append(time_block)
