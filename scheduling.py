import webapp2

from src import config
from src.handlers.basic import BasicHandler
from src.handlers.scheduling.async.add_stage import AddStageHandler
from src.handlers.scheduling.async.add_time_block import AddTimeBlockHandler
from src.handlers.scheduling.async.delete_time_block import DeleteTimeBlockHandler
from src.handlers.scheduling.async.event_details import EventDetailsHandler
from src.handlers.scheduling.async.set_dates import SetDatesHandler
from src.handlers.scheduling.async.set_group_counts import SetGroupCountsHandler
from src.handlers.scheduling.create_groups import CreateGroupsHandler
from src.handlers.scheduling.import_data import ConfirmDeletionHandler
from src.handlers.scheduling.import_data import ImportDataHandler
from src.handlers.scheduling.import_data import WcaImportDataHandler
from src.handlers.scheduling.index import SchedulingIndexCallbackHandler
from src.handlers.scheduling.index import SchedulingIndexHandler
from src.handlers.scheduling.edit_competition import EditCompetitionHandler
from src.handlers.scheduling.edit_schedule import EditScheduleHandler
from src.handlers.scheduling.event_display import EventDisplayHandler
from src.handlers.scheduling.groups_display import GroupsDisplayHandler
from src.handlers.scheduling.new_schedule import NewScheduleCallbackHandler
from src.handlers.scheduling.new_schedule import NewScheduleHandler
from src.handlers.scheduling.schedule_display import ScheduleDisplayHandler
from src.handlers.scheduling.set_live import SetLiveHandler
from src.handlers.scheduling.staff_signup import StaffSignupHandler
from src.handlers.scheduling.update_competition import UpdateCompetitionCallbackHandler
from src.handlers.scheduling.update_competition import UpdateCompetitionHandler
from src.handlers.scheduling.wcif.competition import CompetitionWcifHandler

app = webapp2.WSGIApplication([
  webapp2.Route('/scheduling', handler=SchedulingIndexHandler, name='index'),
  webapp2.Route('/scheduling/index_callback', handler=SchedulingIndexCallbackHandler,
                name='index_callback'),
  webapp2.Route('/scheduling/<competition_id:.*>/edit',
                handler=EditCompetitionHandler,
                name='edit_competition'),
  webapp2.Route('/scheduling/<competition_id:.*>/update',
                handler=UpdateCompetitionHandler,
                name='update_competition'),
  webapp2.Route('/scheduling/update_callback',
                handler=UpdateCompetitionCallbackHandler,
                name='update_competition_callback'),
  webapp2.Route('/scheduling/<competition_id:.*>/new_schedule',
                handler=NewScheduleHandler,
                name='new_schedule'),
  webapp2.Route('/scheduling/new_schedule_callback',
                handler=NewScheduleCallbackHandler,
                name='new_schedule_callback'),
  webapp2.Route('/scheduling/import_data/<schedule_version:.*>',
                handler=ImportDataHandler, name='import_data'),
  webapp2.Route('/scheduling/wca_import', handler=WcaImportDataHandler, name='wca_import'),
  webapp2.Route('/scheduling/confirm_deletion/<schedule_version:.*>',
                handler=ConfirmDeletionHandler, name='confirm_deletion'),
  webapp2.Route('/scheduling/<competition_id:.*>/edit_schedule/<schedule_version:.*>',
                handler=EditScheduleHandler,
                name='edit_schedule'),
  webapp2.Route('/scheduling/set_live/<schedule_version:.*>/<set_live:\d>',
                handler=SetLiveHandler,
                name='set_live'),
  webapp2.Route('/scheduling/create_groups/<schedule_version:.*>',
                handler=CreateGroupsHandler, name='create_groups'),
  webapp2.Route('/scheduling/async/set_schedule_dates/<schedule_version:.*>/<start_date:.*>/<end_date:.*>',
                handler=SetDatesHandler),
  webapp2.Route('/scheduling/async/add_stage/<schedule_version:.*>',
                handler=AddStageHandler),
  webapp2.Route('/scheduling/async/add_time_block/<schedule_version:.*>',
                handler=AddTimeBlockHandler),
  webapp2.Route('/scheduling/async/delete_time_block/<schedule_version:.*>/<time_block_id:.*>',
                handler=DeleteTimeBlockHandler),
  webapp2.Route('/scheduling/async/get_event_details/<schedule_version:.*>/<event_id:.*>',
                handler=EventDetailsHandler,
                name='event_details'),
  webapp2.Route('/scheduling/async/set_group_counts/<schedule_version:.*>',
                handler=SetGroupCountsHandler),
  webapp2.Route('/scheduling/<competition_id:.*>/staff_signup/<user_id:.*>',
                handler=StaffSignupHandler,
                name='staff_signup_with_user'),
  webapp2.Route('/scheduling/<competition_id:.*>/staff_signup',
                handler=StaffSignupHandler,
                name='staff_signup'),
  webapp2.Route('/scheduling/<competition_id:.*>/<schedule_version:.*>/events',
                handler=EventDisplayHandler,
                name='event_display_with_version'),
  webapp2.Route('/scheduling/<competition_id:.*>/events',
                handler=EventDisplayHandler,
                name='event_display'),
  webapp2.Route('/scheduling/<competition_id:.*>/<schedule_version:.*>/schedule',
                handler=ScheduleDisplayHandler,
                name='schedule_display_with_version'),
  webapp2.Route('/scheduling/<competition_id:.*>/schedule',
                handler=ScheduleDisplayHandler,
                name='schedule_display'),
  webapp2.Route('/scheduling/<competition_id:.*>/<schedule_version:.*>/groups',
                handler=GroupsDisplayHandler,
                name='groups_display_with_version'),
  webapp2.Route('/scheduling/<competition_id:.*>/groups',
                handler=GroupsDisplayHandler,
                name='groups_display'),
  webapp2.Route('/scheduling/<competition_id:.*>/<schedule_version:.*>/wcif',
                handler=CompetitionWcifHandler,
                name='competition_wcif_with_version'),
  webapp2.Route('/scheduling/<competition_id:.*>/wcif',
                handler=CompetitionWcifHandler,
                name='competition_wcif'),
  webapp2.Route('/scheduling/wcif_spec',
                handler=BasicHandler('scheduling/wcif_spec.html'),
                name='wcif_spec'),
], config=config.GetAppConfig())
