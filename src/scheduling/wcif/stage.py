import re

from src.scheduling.colors import Colors
from src.scheduling.wcif.extensions import AddExtension
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
