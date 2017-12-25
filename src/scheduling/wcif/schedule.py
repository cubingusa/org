import datetime

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

  output_dict['venues'] = [venue_dict]
  return output_dict
