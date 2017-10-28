import collections
import csv

import cloudstorage as gcs
from google.appengine.api import app_identity
from google.appengine.ext import deferred
from google.appengine.ext import ndb

from src.models.wca import Competition
from src.models.wca import Continent
from src.models.wca import Country
from src.models.wca import Event
from src.models.wca import Format
from src.models.wca import Person
from src.models.wca import RankAverage
from src.models.wca import RankSingle
from src.models.wca import Result
from src.models.wca import RoundType
from src.models.wca.export import WcaExport
from src.models.wca.export import set_latest_export

def fname(table):
  return '/%s/export/%s.tsv' % (app_identity.get_default_gcs_bucket_name(), table)

ROWS_PER_ITERATION = 10000

def process_file(table, object_type, start_row, queue, export_id):
  return
  print 'Processing table %s starting at row %d' % (table, start_row)
  filename = fname(table)
  export_key = ndb.Key(WcaExport, export_id)

  keep_going = False
  with gcs.open(filename, 'r') as gcs_file:
    reader = csv.DictReader(gcs_file, delimiter='\t')
    for i in range(start_row):
      next(reader)
    id_to_dict = collections.defaultdict(dict)
    things_to_look_up = collections.defaultdict(set)
    for row in reader:
      if len(id_to_dict) >= ROWS_PER_ITERATION:
        keep_going = True
        break
      if table == 'Persons':
        id_to_dict[object_type.GetId(row)][int(row['subid'])] = row
      else:
        id_to_dict[object_type.GetId(row)] = row
    print 'Finished reading file'

    object_ids = id_to_dict.keys()
    keys = [ndb.Key(object_type, object_id) for object_id in object_ids]
    query_result = ndb.get_multi_async(keys)
    objects_to_put = []
    for object_id, query_result in zip(object_ids, query_result):
      obj = query_result.get_result() or object_type(id=object_id)
      obj.ParseFromDict(id_to_dict[object_id])
      objects_to_put.append(obj)
    print 'Starting write'
    ndb.put_multi(objects_to_put)
    print 'Finished write'
  
  if keep_going:
    deferred.defer(process_file, table, object_type, start_row + ROWS_PER_ITERATION, queue, export_id)
    return

  if queue:
    new_table, new_object_type = queue.pop(0)
    deferred.defer(process_file, new_table, new_object_type, 0, queue, export_id)
  else:
    old_export = set_latest_export(export_key)
    old_export.delete()
  

def process_export(export_id):
  queue = [('Continents', Continent),
           ('Countries', Country),
           ('Events', Event),
           ('Formats', Format),
           ('RoundTypes', RoundType),
           ('Persons', Person),
           ('RanksSingle', RankSingle),
           ('RanksAverage', RankAverage),
           ('Competitions', Competition),
           ('Results', Result)]
  table, object_type = queue.pop(0)
  deferred.defer(process_file, table, object_type, 0, queue, export_id)
