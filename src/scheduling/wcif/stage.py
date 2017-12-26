import re

from src.scheduling.wcif.time_block import TimeBlockToWcif

# Writes a ScheduleStage in WCIF format.  The corresponding WCIF entity for a
# Stage is called a Room.
# https://docs.google.com/document/d/1hnzAZizTH0XyGkSYe-PxFL5xpKVWl_cvSdTzlT_kAs8/edit?ts=5a3fd252#heading=h.cllgja7au1th
def StageToWcif(stage, time_blocks, groups_by_time_block):
  output_dict = {}
  # Stage ID may be of the form a_b, where a and b are integers.  Use the last
  # segment to ensure an integer ID.
  output_dict['id'] = int(re.search('\d*$', stage.key.id()).group(0))
  output_dict['name'] = stage.name
  output_dict['activities'] = [
      TimeBlockToWcif(time_block, groups_by_time_block[time_block.key.id()])
      for time_block in time_blocks]
  return output_dict