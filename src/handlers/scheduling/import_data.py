import datetime
import json
import urllib
import webapp2

from google.appengine.ext import ndb

from src import common
from src.handlers.oauth import OAuthBaseHandler
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.schedule import Schedule
from src.models.wca.event import Event
from src.models.wca.format import Format
from src.scheduling.wcif.competition import CompetitionToWcif
from src.scheduling.wcif.event import ImportEvents


class ImportBaseHandler(SchedulingBaseHandler):
  def ImportWcif(self, wcif_data, import_events=False):
    entities_to_put = []
    entities_to_delete = []
    if import_events:
      new_to_put, new_to_delete = ImportEvents(wcif_data, self.schedule.key)
      entities_to_put.extend(new_to_put)
      entities_to_delete.extend(new_to_delete)
    ndb.put_multi(entities_to_put)
    ndb.delete_multi(entities_to_delete)
    self.schedule.last_update_time = datetime.datetime.now()
    self.schedule.put()
    template = JINJA_ENVIRONMENT.get_template('success.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'target_uri': webapp2.uri_for('edit_schedule',
                                      schedule_version=self.schedule.key.id())}))


class ImportDataHandler(ImportBaseHandler):
  def post(self, schedule_version):
    if not self.SetSchedule(int(schedule_version)):
      return
    if self.request.get('source') == 'wca':
      self.redirect('/authenticate?' + urllib.urlencode({
          'scope': 'public email manage_competitions',
          'callback': webapp2.uri_for('wca_import', _full=True),
          'handler_data': json.dumps({
              'schedule_version': schedule_version,
              'events_and_rounds': self.request.get('import_events'),
          }),
      }))
    elif 'sched_' in self.request.get('source'):
      schedule_to_import = int(self.request.get('source')[len('sched_'):])
      wcif_to_import = CompetitionToWcif(self.competition,
                                         Schedule.get_by_id(schedule_to_import))
      self.ImportWcif(wcif_to_import,
                      import_events=self.request.get('import_events'))


class WcaImportDataHandler(OAuthBaseHandler, ImportBaseHandler):
  def get(self):
    OAuthBaseHandler.get(self)
    if not self.auth_token:
      return

    handler_data = json.loads(self.handler_data)
    if not self.SetSchedule(int(handler_data['schedule_version'])):
      return

    response = self.GetWcaApi('/api/v0/competitions/%s/wcif' % self.competition.key.id())
    if response.status != 200:
      #self.redirect(webapp2.uri_for('index', unknown=1))
      return
    response_json = json.loads(response.read())
    self.ImportWcif(response_json)
