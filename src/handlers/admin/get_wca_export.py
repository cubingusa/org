import webapp2
import StringIO
import zipfile

import cloudstorage as gcs
from google.appengine.api import app_identity
from google.appengine.api import urlfetch
from google.appengine.ext import deferred

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

  for table in ('Competitions', 'Continents', 'Countries', 'Events', 'Formats',
                'Persons', 'RanksAverage', 'RanksSingle', 'Results', 'RoundTypes'):
    table_file = export_zip.open('WCA_export_%s.tsv' % table)
    filename = '/%s/export/%s.tsv' % (app_identity.get_default_gcs_bucket_name(), table)
    write_retry_params = gcs.RetryParams(backoff_factor=1.1)
    gcs_file = gcs.open(filename, 'w', content_type='text/plain', retry_params=write_retry_params)
    gcs_file.write(table_file.read())
    gcs_file.close()
  strio.close()


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
