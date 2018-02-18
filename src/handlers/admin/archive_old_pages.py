import logging
import re
from HTMLParser import HTMLParser

import cloudstorage as gcs
from google.appengine.api import urlfetch
from google.appengine.ext import deferred

from src import common
from src.handlers.admin.admin_base import AdminBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.user import Roles


class CompSiteParser(HTMLParser, object):
  def __init__(self, site):
    super(CompSiteParser, self).__init__()
    self.site = site
    self.paths = set()

  def handle_starttag(self, tag, attrs):
    for attr in attrs:
      if attr[0] not in ('src', 'href'):
        continue
      path = attr[1]
      if self.site not in path:
        continue
      self.paths.add(path[path.find(self.site) + len(self.site) + 1:])


def ArchiveCompetitionPages(queue):
  pages_to_fetch = ['index.php']
  pages_added = set(pages_to_fetch)
  site = queue[0].strip()
  length = 0

  while pages_to_fetch:
    page = pages_to_fetch.pop()
    cubingusa_url = 'https://www.cubingusa.com/%s/%s' % (site, page)
    result = urlfetch.fetch(cubingusa_url)
    if result.status_code == 200:
      gcs_filename = '/archive/%s/%s' % (site, page)
      with gcs.open(gcs_filename, 'w') as gcs_file:
        gcs_file.write(result.content)
      parser = CompSiteParser(site)
      parser.feed(result.content)
      length += len(result.content)
      for path in parser.paths:
        if path not in pages_added:
          pages_added.add(path)
          pages_to_fetch.append(path)
    else:
      with gcs.open('/archive/errors/%s/%s' % (site, page), 'w') as gcs_file:
        gcs_file.write(result.content)
        gcs_file.write(str(result.status_code))
      logging.warning('%s: %d' % (cubingusa_url, result.status_code))
      logging.warning(result.content)

  logging.info('Total bytes fetched: %d' % length)
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
    deferred.defer(ArchiveCompetitionPages, queue)
    self.response.write('running in background')

  def GetPermittedRoles(self):
    return Roles.AdminRoles()
