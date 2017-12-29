import re

from src.models.scheduling.stage import ScheduleStage
from src.scheduling.colors import Colors
from src.scheduling.wcif.extensions import AddExtension
from src.scheduling.wcif.time_block import ImportTimeBlock
from src.scheduling.wcif.time_block import TimeBlockToWcif

# Writes a ScheduleStage in WCIF format.  The corresponding WCIF entity for a
# Stage is called a Room.
# https://docs.google.com/document/d/1hnzAZizTH0XyGkSYe-PxFL5xpKVWl_cvSdTzlT_kAs8/edit?ts=5a3fd252#heading=h.cllgja7au1th
def StageToWcif(stage, time_blocks, groups_by_time_block):
  time_blocks.sort(key=lambda t: t.start_time)
  output_dict = {}
  output_dict['id'] = stage.number
  output_dict['name'] = stage.name
  output_dict['activities'] = [
      TimeBlockToWcif(time_block, groups_by_time_block[time_block.key.id()])
      for time_block in time_blocks]

  extension_dict = {}
  extension_dict['datastoreId'] = stage.key.id()
  extension_dict['colorCss'] = stage.color
  extension_dict['colorHex'] = Colors[stage.color]
  extension_dict['numTimers'] = stage.timers
  AddExtension('ScheduleStage', extension_dict, output_dict)

  return output_dict


def ImportStage(room_data, schedule, out, stages, time_blocks, groups):
  if 'id' not in room_data:
    out.errors.append('Room is missing id field.')
    return
  if 'name' not in room_data:
    out.errors.append('Room %d is missing name field.' % room_data['id'])
    return
  stage_id = '%s_%d' % (schedule.key.id(), room_data['id'])
  if stage_id in stages:
    stage = stages[stage_id]
    del stages[stage_id]
  else:
    stage = ScheduleStage(id=stage_id)

  stage.schedule = schedule.key
  stage.name = room_data['name']
  stage.timers = 0
  out.entities_to_put.append(stage)

  if 'activities' in room_data:
    for activity_data in room_data['activities']:
      ImportTimeBlock(activity_data, schedule, stage, out, time_blocks, groups)
