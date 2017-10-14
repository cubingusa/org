

class Event(object):
  def __init__(self, event_id, event_name):
    self.event_id = event_id
    self.event_name = event_name

  def Icon(self):
    return '/static/img/events/%s.svg' % self.event_id


events = [
    Event('333', 'Rubik\'s Cube'),
    Event('222', '2x2x2 Cube'),
    Event('444', '4x4x4 Cube'),
    Event('555', '5x5x5 Cube'),
    Event('666', '6x6x6 Cube'),
    Event('777', '7x7x7 Cube'),
    Event('333bf', '3x3x3 Blindfolded'),
    Event('333fm', '3x3x3 Fewest Moves'),
    Event('333oh', '3x3x3 One-Handed'),
    Event('333ft', '3x3x3 With Feet'),
    Event('minx', 'Megaminx'),
    Event('pyram', 'Pyraminx'),
    Event('clock', 'Rubik\'s Clock'),
    Event('skewb', 'Skewb'),
    Event('sq1', 'Square-1'),
    Event('444bf', '4x4x4 Blindfolded'),
    Event('555bf', '5x5x5 Blindfolded'),
    Event('333mbf', '3x3x3 Multiple Blindfolded'),
]
