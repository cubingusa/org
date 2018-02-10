import datetime
import dateutil.parser
import re

from src import timezones
from src.models.scheduling.group import ScheduleGroup
from src.scheduling.wcif.activity_code import ActivityCode

# Writes a ScheduleGroup in WCIF format.  A Group corresponds to an Activity
# in the WCIF spec.
# https://docs.google.com/document/d/1hnzAZizTH0XyGkSYe-PxFL5xpKVWl_cvSdTzlT_kAs8/edit?ts=5a3fd252#heading=h.a8wx47sshf0x
def GroupToWcif(group):
  output_dict = {}
  s = group.stage.get()
  r = group.round.get()
  e = r.event.get()
  print group.key.id()
  output_dict['id'] = int(re.search('(\d+)$', group.key.id()).group(1))
  group_id = '%s%s%d' % (s.name[0], 'S' if group.staff_only else '', group.number)
  output_dict['name'] = '%s %s Group %s' % (
      e.name, 'Final' if r.is_final else 'Round %d' % r.number, group_id)
  activity_code = ActivityCode(event_id=r.event.id(), round_id=r.number,
                               group=group_id, attempt=group.attempt)
  output_dict['activityCode'] = str(activity_code)
  output_dict['startTime'] = group.GetStartTime().isoformat()
  output_dict['endTime'] = group.GetEndTime().isoformat()
  return output_dict

def ImportGroup(group_data, time_block, out, groups):
  if 'id' not in activity_data:
    out.errors.append('activityCode missing from Activity.')
    return
  if 'activityCode' not in activity_data:
    out.errors.append('activityCode missing from Activity %d.' % activity_data['id'])
    return
  try:
    activity_code = ActivityCode.ParseCode(activity_data['activityCode'])
  except Exception as e:
    out.errors.append(e.message)
    return

  if not activity_code.event_id:
    out.errors.append('Missing event ID for activity %s' % activity_data['activityCode'])
    return
  if not activity_code.group:
    out.errors.append('Missing group for activity %s' % activity_data['activityCode'])
    return
  if not activity_code.round_id:
    # We ignore Activities that are not specific to a round.
    return

  if 'startTime' not in activity_data:
    out.errors.append('Missing startTime for activity %s' % activity_data['activityCode'])
    return
  if 'endTime' not in activity_data:
    out.errors.append('Missing endTime for activity %s' % activity_data['activityCode'])
    return

  round_id = ScheduleRound.Id(schedule.key.id(), activity_code.event_id, activity_code.round_id)
  group_id = '%s_%d' % (round_id, activity_data['id'])

  if group_id in groups:
    group = groups.pop(group_id)
  else:
    group = ScheduleGroup(id=group_id)

  group.time_block = time_block.key
  group.number = int(re.search('(\d+)$', activity_code.group).group(1))
  group.start_time = timezones.StripTimezone(dateutil.parser.parse(activity_data['startTime']))
  group.end_time = timezones.StripTimezone(dateutil.parser.parse(activity_data['endTime']))

  out.entities_to_put.append(group)
