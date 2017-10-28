import collections
import csv

import cloudstorage as gcs
from google.appengine.api import app_identity
from google.appengine.ext import deferred
from google.appengine.ext import ndb

from src.models.wca.competition import Competition
from src.models.wca.continent import Continent
from src.models.wca.country import Country
from src.models.wca.event import Event
from src.models.wca.export import WcaExport
from src.models.wca.export import set_latest_export
from src.models.wca.format import Format
from src.models.wca.person import Person
from src.models.wca.rank import RankAverage
from src.models.wca.rank import RankSingle
from src.models.wca.result import Result
from src.models.wca.round import RoundType

def fname(table):
  return '/%s/export/%s.tsv' % (app_identity.get_default_gcs_bucket_name(), table)

def old_fname(table):
  return '/%s/export/%s_old.tsv' % (app_identity.get_default_gcs_bucket_name(), table)

ROWS_PER_ITERATION = 50000

def process_file(table, object_type, start_row, queue, export_id):
  print 'Processing table %s starting at row %d' % (table, start_row)
  filename = fname(table)
  export_key = ndb.Key(WcaExport, export_id)

  keep_going = False
  with gcs.open(filename, 'r') as gcs_file:
    reader = csv.DictReader(gcs_file, delimiter='\t')
    for i in range(start_row):
      next(reader)
    id_to_dict = collections.defaultdict(dict)
    row_filter = object_type.Filter()
    rows_used = 0
    for row in reader:
      rows_used += 1
      if not row_filter(row):
        continue
      if rows_used > ROWS_PER_ITERATION and table != 'Persons':
        keep_going = True
        break
      if table == 'Persons':
        id_to_dict[object_type.GetId(row)][int(row['subid'])] = row
      else:
        id_to_dict[object_type.GetId(row)] = row
    print 'Finished reading file'

    try:
      # Check for rows that have not changed, so we don't need to rewrite them.
      with gcs.open(old_fname(table), 'r') as old_file:
        columns_to_diff = object_type.ColumnsUsed()
        old_reader = csv.DictReader(old_file, delimiter='\t')
        for old_row in old_reader:
          row_id = object_type.GetId(old_row)
          if row_id in id_to_dict:
            new_row = id_to_dict[row_id]
            if table == 'Persons':
              new_row = id_to_dict[row_id][int(row['subid'])]
            is_diff = False
            for col in columns_to_diff:
              if new_row[col] != old_row[col]:
                is_diff = True
            if table == 'Persons':
              new_row['changed'] = is_diff
            elif not is_diff:
              del id_to_dict[row_id]
      if table == 'Persons':
        # A Person is split across a few rows with a common personId.  If any of them
        # have changed, then we need to update the Person.  This includes rows that
        # are missing on the base side: this means that this is a new person or a new
        # subid.
        keys_to_delete = []
        for key, rows in id_to_dict.iteritems():
          for row in rows.itervalues():
            changed = False
            if 'changed' not in row or row['changed']:
              changed = True
          if not changed:
            keys_to_delete.append(key)
        for key in keys_to_delete:
          del id_to_dict[key]
    except gcs.NotFoundError:
      # This is fine, it just means we can't diff the new file against the old one.
      pass

    print 'Finished diffing'

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

  # We're done with this table.  Save it as the old table.
  gcs.copy2(fname(table), old_fname(table))

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
