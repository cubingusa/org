import logging
import re
from HTMLParser import HTMLParser

import cloudstorage as gcs
from google.appengine.api import app_identity
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
      if path.startswith('assets'):
        self.paths.add(path)
      elif self.site in path:
        self.paths.add(path[path.find(self.site) + len(self.site) + 1:])


def ArchiveCompetitionPages(queue):
  pages_to_fetch = ['index.php',
                    'assets/styles/fonts/entsans.ttf',
                    'assets/styles/fonts/gilliesgothicboldregular.ttf']
  pages_to_ignore = set(['mapper.php', 'contact.php', 'psych.php', 'login.php'])
  pages_added = set(pages_to_fetch)
  site = queue[0].strip()
  length = 0
  logging.info('Fetching from https://www.cubingusa.com/%s' % site)

  while pages_to_fetch:
    page = pages_to_fetch.pop()
    if page in pages_to_ignore:
      continue
    cubingusa_url = 'https://www.cubingusa.com/%s/%s' % (site, page)
    result = urlfetch.fetch(cubingusa_url)
    if result.status_code == 200:
      gcs_filename = '/%s/archive/%s/%s' % (app_identity.get_default_gcs_bucket_name(), site, page)
      with gcs.open(gcs_filename, 'w') as gcs_file:
        gcs_file.write(result.content)
      length += len(result.content)
      if '.php' in page:
        parser = CompSiteParser(site)
        parser.feed(result.content.decode('utf-8'))
        for path in parser.paths:
          if '?' in path:
            path = path[:path.find('?')]
          if path not in pages_added:
            pages_added.add(path)
            pages_to_fetch.append(path)
    else:
      with gcs.open('/%s/archive/errors/%s/%s' %
                    (app_identity.get_default_gcs_bucket_name(), site, page), 'w') as gcs_file:
        gcs_file.write(result.content)
        gcs_file.write(str(result.status_code))
      logging.warning('%s: %d' % (cubingusa_url, result.status_code))
      logging.warning(result.content)

  logging.info('Total bytes fetched: %d' % length)
  if len(queue) > 1:
    deferred.defer(ArchiveCompetitionPages, queue[1:], _countdown=15)


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
