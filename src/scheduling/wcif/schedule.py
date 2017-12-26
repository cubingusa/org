import collections
import datetime

from src.models.scheduling.group import ScheduleGroup
from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.stage import ScheduleStage
from src.models.scheduling.time_block import ScheduleTimeBlock
from src.scheduling.wcif.extensions import AddExtension
from src.scheduling.wcif.stage import StageToWcif
from src.timezones import ToLocalizedTime

# Writes a Schedule in WCIF format.
# https://docs.google.com/document/d/1hnzAZizTH0XyGkSYe-PxFL5xpKVWl_cvSdTzlT_kAs8/edit?ts=5a3fd252#heading=h.hsdqzy8dh3z8
def ScheduleToWcif(schedule, competition, wca_competition):
  output_dict = {}
  output_dict['startDate'] = schedule.start_date.strftime('%Y-%m-%d')
  output_dict['numberOfDays'] = (
      (schedule.end_date - schedule.start_date).days + 1)
  # The CubingUSA scheduling system is not designed to support competitions
  # with more than one venue.
  venue_dict = {}
  venue_dict['id'] = 0
  # TODO: pass along the venue information from the WCA export.
  if wca_competition:
    venue_dict['latitude'] = wca_competition.latitude / 1000000.
    venue_dict['longitude'] = wca_competition.longitude / 1000000.
  venue_dict['timezone'] = competition.timezone

  all_stages = ScheduleStage.query(ScheduleStage.schedule == schedule.key).fetch()
  all_rounds = ScheduleRound.query(ScheduleRound.schedule == schedule.key).fetch()

  time_blocks_by_stage = collections.defaultdict(list)
  for t in ScheduleTimeBlock.query(ScheduleTimeBlock.schedule == schedule.key).iter():
    time_blocks_by_stage[t.stage.id()].append(t)

  groups_by_stage_and_time_block = (
      collections.defaultdict(lambda: collections.defaultdict(list)))
  for g in ScheduleGroup.query(ScheduleGroup.schedule == schedule.key).iter():
    groups_by_stage_and_time_block[g.stage.id()][g.time_block.id()].append(g)

  venue_dict['rooms'] = []
  for stage in all_stages:
    venue_dict['rooms'].append(StageToWcif(
        stage, time_blocks_by_stage[stage.key.id()],
        groups_by_stage_and_time_block[stage.key.id()]))
  output_dict['venues'] = [venue_dict]

  extension_dict = {}
  extension_dict['datastoreId'] = schedule.key.id()
  extension_dict['creationTime'] = (
      ToLocalizedTime(schedule.creation_time, competition.timezone).isoformat())
  extension_dict['lastUpdateTime'] = (
      ToLocalizedTime(schedule.last_update_time, competition.timezone).isoformat())
  AddExtension('Schedule', extension_dict, output_dict)

  return output_dict
