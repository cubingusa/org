from src.models.scheduling.group import ScheduleGroup
from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.stage import ScheduleStage
from src.models.scheduling.time_block import ScheduleTimeBlock

def EntityToString(entity):
  if type(entity) is ScheduleRound:
    return '%s round %d' % (entity.event.id(), entity.number)
  elif type(entity) is ScheduleTimeBlock:
    r = entity.round.get()
    s = entity.stage.get()
    return '%s round %d, %s stage from %s to %s' % (
        r.event.id(), r.number, s.name,
        entity.GetStartTime().strftime('%A %-I:%M %p'),
        entity.GetEndTime().strftime('%-I:%M %p'))
  elif type(entity) is ScheduleGroup:
    r = entity.round.get()
    s = entity.stage.get()
    return '%s round %d, %s stage group %d' % (
        r.event.id(), r.number, s.name, entity.number)
  elif type(entity) is ScheduleStage:
    return '%s stage' % entity.name
  else:
    return entity.key
