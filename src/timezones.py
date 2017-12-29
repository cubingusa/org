import datetime
import pytz

# Parses a datetime string to UTC so that it can be stored in a datastore model.
def ToUTCTime(time_string, time_format, timezone):
  d = datetime.datetime.strptime(time_string, time_format)
  return pytz.timezone(timezone).localize(d).astimezone(pytz.timezone('UTC')).replace(tzinfo=None)

# Converts a UTC time to a localized time.
def ToLocalizedTime(d, timezone):
  return pytz.timezone('UTC').localize(d).astimezone(pytz.timezone(timezone))

# Returns a datetime at theh same moment in time without a timezone.
def StripTimezone(d):
  return d.astimezone(pytz.timezone('UTC')).replace(tzinfo=None)
