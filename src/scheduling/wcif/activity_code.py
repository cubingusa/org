from src.models.wca.event import Event

event_ids = []

class ActivityCode:
  def __init__(self, event_id=None, round_id=None, group=None, attempt=None):
    self.event_id = event_id
    self.round_id = round_id
    self.group = group
    self.attempt = attempt
    self.other_string = None

  def __str__(self):
    if self.other_string:
      return 'other-' + self.other_string

    pieces = []
    if self.event_id:
      pieces.append(self.event_id)
    if self.round_id:
      pieces.append('r%d' % self.round_id)
    if self.group:
      pieces.append('g%s' % self.group)
    if self.attempt:
      pieces.append('a%d' % self.attempt)
    return '-'.join(pieces)

  @staticmethod
  def ParseCode(code_string):
    global event_ids
    if not event_ids:
      event_ids = set([key.id() for key in Event.query().iter(keys_only=True)])

    out = ActivityCode()
    if 'other-' in code_string:
      out.other_string = code_string[len('other-'):]
      return out
    for piece in code_string.split('-'):
      if piece in event_ids:
        out.event_id = piece
      elif piece[0] == 'r':
        out.round_id = int(piece[1:])
      elif piece[0] == 'g':
        out.group = piece[1:]
      elif piece[0] == 'a':
        out.attempt = int(piece[1:])
      else:
        raise Exception('Error parsing ActivityCode \'%s\': ' +
                        'unrecognized component \'%s\'' % (code_string, piece))
    return out
