import collections

from src.models.scheduling.round import ScheduleRound
from src.scheduling.wcif.event import EventToWcif
from src.scheduling.wcif.extensions import AddExtension
from src.scheduling.wcif.schedule import ScheduleToWcif

# Writes a ScheduleCompetition in WCIF format.
# https://docs.google.com/document/d/1hnzAZizTH0XyGkSYe-PxFL5xpKVWl_cvSdTzlT_kAs8/edit?ts=5a3fd252#heading=h.ytob2sxb7khl
def CompetitionToWcif(competition, schedule):
  output_dict = {}
  output_dict['formatVersion'] = '1.0'
  output_dict['id'] = competition.key.id()
  output_dict['name'] = competition.name
  wca_competition = competition.wca_competition.get()

  # TODO: add people

  rounds_by_event_id = collections.defaultdict(list)
  for r in ScheduleRound.query(ScheduleRound.schedule == schedule.key):
    rounds_by_event_id[r.event.id()].append(r)
  output_dict['events'] = []
  for event_id, rounds in rounds_by_event_id.iteritems():
    output_dict['events'].append(EventToWcif(event_id, rounds))
  
  if schedule:
    output_dict['schedule'] = ScheduleToWcif(schedule, competition, wca_competition)
  
  extension_dict = {}
  extension_dict['datastoreId'] = competition.key.id()
  extension_dict['staffSignupDeadline'] = (
      competition.staff_signup_deadline.strftime('%Y-%m-%d'))
  AddExtension('ScheduleCompetition', extension_dict, output_dict)
  
  return output_dict
