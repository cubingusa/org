from src.scheduling.wcif.schedule import ScheduleToWcif

# Writes a ScheduleCompetition in WCIF format.
# https://docs.google.com/document/d/1hnzAZizTH0XyGkSYe-PxFL5xpKVWl_cvSdTzlT_kAs8/edit?ts=5a3fd252#heading=h.ytob2sxb7khl
def CompetitionToWcif(competition, schedule):
  output_dict = {}
  output_dict['formatVersion'] = '1.0'
  output_dict['id'] = competition.key.id()
  wca_competition = competition.wca_competition.get()
  if wca_competition:
    output_dict['name'] = competition.wca_competition.get().name

  # TODO: add people
  # TODO: add events
  if schedule:
    output_dict['schedule'] = ScheduleToWcif(schedule, competition, wca_competition)
  return output_dict
