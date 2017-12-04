import random

from src import common
from src.scheduling.colors import Colors
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.stage import ScheduleStage


class AddStageHandler(SchedulingBaseHandler):
  def post(self, schedule_version):
    if not self.SetSchedule(int(schedule_version)):
      return
    stage_id = self.request.POST['id']
    old_stage = ScheduleStage.get_by_id(stage_id)
    is_new_stage = not old_stage

    if old_stage and old_stage.schedule != self.schedule.key:
      return
    stage = old_stage or ScheduleStage(id=stage_id)

    stage.schedule = self.schedule.key
    stage.name = self.request.POST['name']
    if self.request.POST['color'] in Colors:
      stage.color = self.request.POST['color']
    else:
      del stage.color
    stage.timers = int(self.request.POST['timers'])
    if not stage.number:
      max_stage = (ScheduleStage
                     .query(ScheduleStage.schedule == self.schedule.key)
                     .order(-ScheduleStage.number)
                     .get())
      if max_stage:
        stage.number = max_stage.number + 1
      else:
        stage.number = 1
    stage.put()

    template = JINJA_ENVIRONMENT.get_template('scheduling/stages.html')
    stages = (ScheduleStage
                  .query(ScheduleRound.schedule == self.schedule.key)
                  .order(ScheduleRound.number)
                  .fetch())
    if is_new_stage:
      stages.append(stage)
    self.response.write(template.render({
        'c': common.Common(self),
        'stages': stages,
        'new_stage_id': '%s_%d' % (schedule_version, random.randint(2 ** 4, 2 ** 32)),
        'colors': sorted(Colors.keys()),
    }))
