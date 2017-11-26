import webapp2

from src import config
from src.handlers.scheduling.index import SchedulingIndexHandler
from src.handlers.scheduling.edit_competition import EditCompetitionHandler
from src.handlers.scheduling.new_competition import NewCompetitionHandler

app = webapp2.WSGIApplication([
  webapp2.Route('/scheduling', handler=SchedulingIndexHandler, name='index'),
  webapp2.Route('/scheduling/edit/<competition_id:.*>',
                handler=EditCompetitionHandler,
                name='edit_competition'),
  webapp2.Route('/scheduling/new_competition',
                handler=NewCompetitionHandler,
                name='new_competition'),
  webapp2.Route('/scheduling/edit_schedule/<schedule_version:.*>',
                handler=SchedulingIndexHandler,
                name='edit_schedule'),
], config=config.GetAppConfig())
