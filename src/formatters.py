def parse_time(time):
  centiseconds = time % 100
  res = time / 100
  seconds = res % 60
  res = res / 60
  minutes = res % 60
  hours = res / 60
  return (hours, minutes, seconds, centiseconds)

def FormatStandard(time):
  hours, minutes, seconds, centiseconds = parse_time(time)
  if hours > 0:
    return '%d:%02d:%02d' % (hours, minutes, seconds)
  elif minutes > 10:
    return '%d:%02d' % (minutes, seconds)
  elif minutes > 0:
    return '%d:%02d.%02d' % (minutes, seconds, centiseconds)
  else:
    return '%01d.%02d' % (seconds, centiseconds)

def FormatVerbose(time):
  if time >= 6000:
    return FormatStandard(time)
  else:
    return '%s seconds' % FormatStandard(time)

def FormatMultiBlindOld(time, verbose):
  time_in_seconds = time % 100000
  res = time / 100000
  attempted = res % 100
  solved = 199 - res / 100

  if verbose:
    return '%d out of %d cubes in %s' % (solved, attempted, FormatStandard(time_in_seconds * 100))
  else:
    return '%d/%d %s' % (solved, attempted, FormatStandard(time_in_seconds * 100))

def FormatMultiBlind(time, verbose):
  missed = time % 100
  res = time / 100
  time_in_seconds = res % 100000
  delta = 99 - res / 100000
  solved = missed + delta
  attempted = solved + missed

  if verbose:
    return '%d out of %d cubes in %s' % (solved, attempted, FormatStandard(time_in_seconds * 100))
  else:
    return '%d/%d %s' % (solved, attempted, FormatStandard(time_in_seconds * 100))

def FormatFewestMoves(time, is_average, verbose):
  result = str(time)
  if is_average:
    result = '%d.%02d' % (time / 100, time % 100)
  if verbose:
    return '%s moves%s' % (result, ' (average)' if is_average else '')
  else:
    return result

def FormatTime(time, event_key, is_average, verbose=False):
  if time == -1:
    return 'DNF'
  elif time == -2:
    return 'DNS'
  elif event_key.id() == '333fm':
    return FormatFewestMoves(time, is_average, verbose)
  elif event_key.id() in ('333mbf', '333mbo'):
    if time > 1000000000:
      return FormatMultiBlindOld(time, verbose)
    else:
      return FormatMultiBlind(time, verbose)
  elif verbose:
    return FormatVerbose(time)
  else:
    return FormatStandard(time)

def FormatResult(result, verbose=False):
  is_average = result.fmt.id() in ('a', 'm')
  if is_average:
    return FormatTime(result.average, result.event, True, verbose)
  else:
    return FormatTime(result.best, result.event, False, verbose)
