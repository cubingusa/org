import webapp2

from src import config
from src.handlers.scheduling.async.add_stage import AddStageHandler
from src.handlers.scheduling.async.add_time_block import AddTimeBlockHandler
from src.handlers.scheduling.async.event_details import EventDetailsHandler
from src.handlers.scheduling.async.set_dates import SetDatesHandler
from src.handlers.scheduling.index import SchedulingIndexHandler
from src.handlers.scheduling.edit_competition import EditCompetitionHandler
from src.handlers.scheduling.edit_schedule import EditScheduleHandler
from src.handlers.scheduling.event_display import EventDisplayHandler
from src.handlers.scheduling.new_schedule import NewScheduleCallbackHandler
from src.handlers.scheduling.new_schedule import NewScheduleHandler
from src.handlers.scheduling.set_live import SetLiveHandler
from src.handlers.scheduling.staff_signup import StaffSignupHandler
from src.handlers.scheduling.update_competition import UpdateCompetitionCallbackHandler
from src.handlers.scheduling.update_competition import UpdateCompetitionHandler

app = webapp2.WSGIApplication([
  webapp2.Route('/scheduling', handler=SchedulingIndexHandler, name='index'),
  webapp2.Route('/scheduling/edit/<competition_id:.*>',
                handler=EditCompetitionHandler,
                name='edit_competition'),
  webapp2.Route('/scheduling/update_competition',
                handler=UpdateCompetitionHandler,
                name='update_competition'),
  webapp2.Route('/scheduling/update_competition_callback',
                handler=UpdateCompetitionCallbackHandler,
                name='update_competition_callback'),
  webapp2.Route('/scheduling/edit_schedule/<schedule_version:.*>',
                handler=EditScheduleHandler,
                name='edit_schedule'),
  webapp2.Route('/scheduling/new_schedule/<competition_id:.*>',
                handler=NewScheduleHandler,
                name='new_schedule'),
  webapp2.Route('/scheduling/new_schedule_callback',
                handler=NewScheduleCallbackHandler,
                name='new_schedule_callback'),
  webapp2.Route('/scheduling/set_live/<schedule_version:.*>/<set_live:\d>',
                handler=SetLiveHandler,
                name='set_live'),
  webapp2.Route('/scheduling/async/set_schedule_dates/<schedule_version:.*>/<start_date:.*>/<end_date:.*>',
                handler=SetDatesHandler),
  webapp2.Route('/scheduling/async/add_stage/<schedule_version:.*>',
                handler=AddStageHandler),
  webapp2.Route('/scheduling/async/add_time_block/<schedule_version:.*>',
                handler=AddTimeBlockHandler),
  webapp2.Route('/scheduling/async/get_event_details/<schedule_version:.*>/<event_id:.*>',
                handler=EventDetailsHandler,
                name='event_details'),
  webapp2.Route('/scheduling/staff_signup/<competition_id:.*>/<user_id:.*>',
                handler=StaffSignupHandler,
                name='staff_signup_with_user'),
  webapp2.Route('/scheduling/staff_signup/<competition_id:.*>',
                handler=StaffSignupHandler,
                name='staff_signup'),
  webapp2.Route('/scheduling/<competition_id:.*>/events',
                handler=EventDisplayHandler,
                name='event_display'),
], config=config.GetAppConfig())
