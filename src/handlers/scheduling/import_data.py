import datetime
import json
import urllib
import webapp2

from google.appengine.api import urlfetch
from google.appengine.ext import ndb

from src import common
from src.scheduling.entity_to_string import EntityToString
from src.handlers.oauth import OAuthBaseHandler
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.schedule import Schedule
from src.models.wca.event import Event
from src.models.wca.format import Format
from src.scheduling.wcif.competition import CompetitionToWcif
from src.scheduling.wcif.event import ImportEvents
from src.scheduling.wcif.schedule import ImportSchedule


class ImportOutput:
  def __init__(self):
    self.entities_to_put = []
    self.entities_to_delete = []
    self.errors = []


class ImportBaseHandler(SchedulingBaseHandler):
  def ImportWcif(self, wcif_data, data_to_import, deletion_confirmed=False):
    out = ImportOutput()
    if 'events' in data_to_import:
      ImportEvents(wcif_data, self.schedule.key, out)
    if 'schedule' in data_to_import:
      ImportSchedule(wcif_data, self.schedule, out)

    if out.errors:
      template = JINJA_ENVIRONMENT.get_template('scheduling/import_error.html')
      self.response.write(template.render({
          'c': common.Common(self),
          'errors': out.errors}))
    elif out.entities_to_delete and not deletion_confirmed:
      template = JINJA_ENVIRONMENT.get_template('scheduling/confirm_deletion.html')
      self.response.write(template.render({
          'c': common.Common(self),
          'entities_to_delete': out.entities_to_delete,
          'entity_to_string': EntityToString,
          'wcif_data': json.dumps(wcif_data),
          'target_uri': webapp2.uri_for('confirm_deletion',
                                        schedule_version=self.schedule.key.id()),
          'data_to_import': data_to_import,
      }))
    else:
      self.schedule.last_update_time = datetime.datetime.now()
      out.entities_to_put.append(self.schedule)
      ndb.put_multi(out.entities_to_put)
      ndb.delete_multi([e.key for e in out.entities_to_delete])
      template = JINJA_ENVIRONMENT.get_template('success.html')
      self.response.write(template.render({
          'c': common.Common(self),
          'target_uri': webapp2.uri_for('edit_schedule',
                                        competition_id=self.competition.key.id(),
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
              'data_to_import': self.request.POST.getall('data_to_import'),
          }),
      }))
    elif 'sched_' in self.request.get('source'):
      schedule_to_import = int(self.request.get('source')[len('sched_'):])
      wcif_to_import = CompetitionToWcif(self.competition,
                                         Schedule.get_by_id(schedule_to_import))
      self.ImportWcif(wcif_to_import,
                      data_to_import=self.request.POST.getall('data_to_import'))
    elif self.request.get('source') == 'custom':
      result = urlfetch.fetch(self.request.get('custom_uri'))
      if result.status_code != 200:
        template = JINJA_ENVIRONMENT.get_template('error.html')
        self.response.write(template.render({
            'c': common.Common(self),
            'error': 'Error fetching %s' % self.request.get('custom_uri')}))
        return
      self.ImportWcif(json.loads(result.content),
                      data_to_import=self.request.POST.getall('data_to_import'))


class WcaImportDataHandler(OAuthBaseHandler, ImportBaseHandler):
  def get(self):
    OAuthBaseHandler.GetTokenFromCode(self)
    if not self.auth_token:
      return

    handler_data = json.loads(self.handler_data)
    if not self.SetSchedule(int(handler_data['schedule_version'])):
      return

    response = self.GetWcaApi('/api/v0/competitions/%s/wcif' % self.competition.key.id())
    if response.status != 200:
      template = JINJA_ENVIRONMENT.get_template('scheduling/import_error.html')
      self.response.write(template.render({
          'c': common.Common(self),
          'errors': ['Error fetching WCA import']}))
      return
    response_json = json.loads(response.read())
    self.ImportWcif(response_json,
                    data_to_import=handler_data['data_to_import'])


class ConfirmDeletionHandler(ImportBaseHandler):
  def post(self, schedule_version):
    if not self.SetSchedule(int(schedule_version)):
      return
    self.ImportWcif(json.loads(self.request.get('wcif_data')),
                    data_to_import=self.request.POST.getall('data_to_import'),
                    deletion_confirmed=True)
