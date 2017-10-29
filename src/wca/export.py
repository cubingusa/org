import collections
import csv

import cloudstorage as gcs
from google.appengine.api import app_identity
from google.appengine.ext import deferred
from google.appengine.ext import ndb

from src.post_import import mutations
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


def fname(table, shard):
  return '/%s/export/%s.%d.tsv' % (app_identity.get_default_gcs_bucket_name(), table, shard)


def old_fname(table, shard):
  return '/%s/export/%s_old.%d.tsv' % (app_identity.get_default_gcs_bucket_name(), table, shard)


def process_file(table, object_type, shard, total_shards, queue, export_id):
  print 'Processing table %s shard %d/%d' % (table, shard, total_shards)
  filename = fname(table, shard)

  with gcs.open(filename, 'r') as gcs_file:
    reader = csv.DictReader(gcs_file, delimiter='\t')
    id_to_dict = collections.defaultdict(dict)
    row_filter = object_type.Filter()
    for row in reader:
      if not row_filter(row):
        continue
      if table == 'Persons':
        id_to_dict[object_type.GetId(row)][int(row['subid'])] = row
      else:
        id_to_dict[object_type.GetId(row)] = row
    print 'Finished reading file.  Found %d entries' % len(id_to_dict)

    keys_to_delete = []

    try:
      # Check for rows that have not changed, so we don't need to rewrite them.
      with gcs.open(old_fname(table, shard), 'r') as old_file:
        columns_to_diff = object_type.ColumnsUsed()
        old_reader = csv.DictReader(old_file, delimiter='\t')
        for old_row in old_reader:
          if not row_filter(old_row):
            continue
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
          else:
            # This entry has been deleted, so we delete it.
            keys_to_delete.append(ndb.Key(object_type, row_id))
      if table == 'Persons':
        # A Person is split across a few rows with a common personId.  If any of them
        # have changed, then we need to update the Person.  This includes rows that
        # are missing on the base side: this means that this is a new person or a new
        # subid.
        unchanged_keys = []
        for key, rows in id_to_dict.iteritems():
          for row in rows.itervalues():
            changed = False
            if ('changed' not in row) or row['changed']:
              changed = True
          if not changed:
            unchanged_keys.append(key)
        for key in unchanged_keys:
          del id_to_dict[key]
    except gcs.NotFoundError:
      # This is fine, it just means we can't diff the new file against the old one.
      pass

    print 'Finished diffing.  Inserting %d entries.' % len(id_to_dict)
    print 'Deleting %d entries.' % len(keys_to_delete)
    if keys_to_delete:
      print 'Deleting: %s' % (', '.join(key.id() for key in keys_to_delete[:10]))

    ndb.delete_multi(keys_to_delete)

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

  # We're done with this shard, make it the new finished table.
  gcs.copy2(fname(table, shard), old_fname(table, shard))

  if shard + 1 < total_shards:
    deferred.defer(process_file, table, object_type, shard + 1, total_shards, queue, export_id)
  elif queue:
    new_table, new_object_type, new_shards = queue.pop(0)
    deferred.defer(process_file, new_table, new_object_type, 0, new_shards, queue, export_id)
  else:
    export_key = ndb.Key(WcaExport, export_id)
    old_export = set_latest_export(export_key)
    if old_export:
      old_export.key.delete()
    mutations.DoMutations()
  

def get_tables():
  return [('Continents', Continent, 1),
          ('Countries', Country, 1),
          ('Events', Event, 1),
          ('Formats', Format, 1),
          ('RoundTypes', RoundType, 1),
          ('Persons', Person, 3),
          ('RanksSingle', RankSingle, 6),
          ('RanksAverage', RankAverage, 6),
          ('Competitions', Competition, 1),
          ('Results', Result, 40)]


def process_export(export_id):
  queue = get_tables()
  table, object_type, shards = queue.pop(0)
  deferred.defer(process_file, table, object_type, 0, shards, queue, export_id)
