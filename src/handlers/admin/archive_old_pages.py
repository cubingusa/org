import logging

import cloudstorage as gcs
from google.appengine.api import urlfetch
from google.appengine.ext import deferred

from src import common
from src.handlers.admin.admin_base import AdminBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.user import Roles


def ArchiveCompetitionPages(queue, pages_to_fetch):
  for page in pages_to_fetch:
    page = page.strip()
    site = queue[0].strip()
    cubingusa_url = 'https://www.cubingusa.com/%s/%s' % (site, page)
    result = urlfetch.fetch(cubingusa_url)
    if result.status_code == 200:
      gcs_filename = '/archive/%s/%s' % (site, page)
      with gcs.open(gcs_filename, 'w') as gcs_file:
        gcs_file.write(result.content)
    else:
      with gcs.open('/archive/errors/%s/%s' % (site, page), 'w') as gcs_file:
        gcs_file.write(result.content)
        gcs_file.write(str(result.status_code))
      logging.warning('%s: %d' % (cubingusa_url, result.status_code))
      logging.warning(result.content)

  if len(queue) > 1:
    deferred.defer(ArchiveCompetitionPages, queue[1:], pages_to_fetch, _countdown=15)


class ArchivePagesHandler(AdminBaseHandler):
  def get(self):
    template = JINJA_ENVIRONMENT.get_template('admin/archive_pages.html')
    self.response.write(template.render({
      'c': common.Common(self),
    }))

  def post(self):
    queue = self.request.POST['competition_sites'].split('\n')
    pages_to_fetch = self.request.POST['pages_to_fetch'].split('\n')
    deferred.defer(ArchiveCompetitionPages, queue, pages_to_fetch)
    self.response.write('running in background')

  def GetPermittedRoles(self):
    return Roles.AdminRoles()
