import re
import webapp2
import StringIO
import zipfile

import cloudstorage as gcs
from google.appengine.api import app_identity
from google.appengine.api import urlfetch
from google.appengine.ext import deferred

from src.models.wca.export import WcaExport
from src.models.wca.export import get_latest_export
from src.wca import export
from src.wca import sharder

CHUNK_SIZE = 16 * 1024 * 1024

def fname(idx):
  return '/%s/export_tmp/WCA_export.tsv.zip.%d' % (app_identity.get_default_gcs_bucket_name(), idx)

def assemble_zip(file_count):
  strio = StringIO.StringIO()
  for idx in range(file_count):
    filename = fname(idx)
    gcs_file = gcs.open(filename, 'r')
    strio.write(gcs_file.read())
    gcs_file.close()
  export_zip = zipfile.ZipFile(strio)

  new_export_id = None
  date_regex = re.compile('Date:\s*(.*)')

  with export_zip.open('README.txt') as readme_file:
    for line in readme_file:
      m = date_regex.search(line)
      if m:
        new_export_id = m.group(1)

  if not new_export_id:
    # TODO: surface error
    return

  new_export = WcaExport.get_by_id(new_export_id) or WcaExport(id=new_export_id)
  if get_latest_export() and new_export.key == get_latest_export().key:
    # We're trying to reimport the same WCA export.  Abort.
    return
  new_export.put()

  sharder.write_sharded_files(export_zip)
  strio.close()

  export.process_export(new_export_id)

def download_export_chunk(idx):
  if idx > 10:
    return
  headers = {'Range': 'bytes=%d-%d' % (idx * CHUNK_SIZE, (idx + 1) * CHUNK_SIZE - 1)}
  fetch_result = urlfetch.fetch(
      'https://www.worldcubeassociation.org/results/misc/WCA_export.tsv.zip',
      headers=headers)

  write_retry_params = gcs.RetryParams(backoff_factor=1.1)
  filename = fname(idx)
  gcs_file = gcs.open(filename, 'w', content_type='application/octet-stream', retry_params=write_retry_params)
  gcs_file.write(fetch_result.content)
  gcs_file.close()

  print 'Fetched %d bytes' % len(fetch_result.content)

  if len(fetch_result.content) < CHUNK_SIZE:
    deferred.defer(assemble_zip, idx + 1)
  else:
    deferred.defer(download_export_chunk, idx + 1)
  

class GetExportHandler(webapp2.RequestHandler):
  def get(self):
    deferred.defer(download_export_chunk, idx=0)
