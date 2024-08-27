import csv

from absl import app
from absl import flags
from absl import logging
from google.cloud import ndb

from app.load_db.email_championship_organizers import EmailChampionshipOrganizers
from app.load_db.update_champions import UpdateChampions
from app.load_db.update_championships import UpdateChampionships
from app.load_db.update_state_records import UpdateStateRecords
from app.models.user import User
from app.models.wca.competition import Competition
from app.models.wca.continent import Continent
from app.models.wca.country import Country
from app.models.wca.event import Event
from app.models.wca.export import set_latest_export
from app.models.wca.format import Format
from app.models.wca.person import Person
from app.models.wca.rank import RankAverage
from app.models.wca.rank import RankSingle
from app.models.wca.result import Result
from app.models.wca.round import RoundType


FLAGS = flags.FLAGS

flags.DEFINE_string('old_export_id', '', 'ID of the old export.')
flags.DEFINE_string('new_export_id', '', 'ID of the new export.')
flags.DEFINE_string('export_base', '', 'Base directory of exports.')

def get_tables():
  return [('Continents', Continent, 1),
          ('Countries', Country, 1),
          ('Events', Event, 1),
          ('Formats', Format, 1),
          ('RoundTypes', RoundType, 1),
          ('Persons', Person, 1),
          ('RanksSingle', RankSingle, 5),
          ('RanksAverage', RankAverage, 5),
          ('Competitions', Competition, 5),
          ('Results', Result, 10),
         ]


# Ideally this would live in person.py, but that would be a circular dependency
# between Person and User.
def get_modifier(table):
  if table == 'Persons':
    id_to_state = {}
    for user in User.query(User.state != None):
      if user.wca_person:
        id_to_state[user.wca_person.id()] = user.state

    def modify(person):
      if person.key.id() in id_to_state:
        person.state = id_to_state[person.key.id()]
    return modify
  return None


def read_table(path, cls, apply_filter, shard, shards):
  filter_fn = lambda row: True
  if apply_filter:
    filter_fn = cls.Filter()
  out = {}
  try:
    with open(path) as csvfile:
      reader = csv.DictReader(csvfile, dialect='excel-tab')
      for row in reader:
        if filter_fn(row):
          fields_to_write = cls.ColumnsUsed()
          if 'id' in row:
            fields_to_write += ['id']
          to_write = {}
          for field in fields_to_write:
            if field in row:
              to_write[field] = row[field]
          row_id = cls.GetId(row)
          if row_id % shards == shard:
            out[row_id] = to_write
  except:
    # This is fine, the file might just not exist.
    pass
  return out


def write_table(path, rows, cls):
  use_id = False
  with open(path, 'r') as csvfile:
    reader = csv.DictReader(csvfile, dialect='excel-tab')
    use_id = 'id' in reader.fieldnames
  with open(path + '.filtered', 'w') as csvfile:
    fields_to_write = cls.ColumnsUsed()
    if use_id:
      fields_to_write += ['id']
    writer = csv.DictWriter(csvfile, dialect='excel-tab', fieldnames=fields_to_write)
    writer.writeheader()
    for row in rows.items():
      writer.writerow({k: v for k, v in row[1].items() if k in fields_to_write})


def process_export(old_export_path, new_export_path):
  client = ndb.Client()
  for table, cls, shards in get_tables():
    logging.info('Processing ' + table)
    table_suffix = '/WCA_export_' + table + '.tsv'
    with client.context():
      for shard in range(shards):
        logging.info('Shard %d/%d' % (shard + 1, shards))
      old_rows = read_table(old_export_path + table_suffix + '.filtered', cls, False, shard, shards)
      new_rows = read_table(new_export_path + table_suffix, cls, True, shard, shards)
      logging.info('Old: %d' % len(old_rows))
      logging.info('New: %d' % len(new_rows))
      write_table(new_export_path + table_suffix, new_rows, cls)

      objects_to_put = []
      keys_to_delete = []

      modifier = get_modifier(table)
      for key in new_rows:
        row = new_rows[key]
        if key in old_rows and old_rows[key] == row:
          continue
        else:
          obj = cls(id=key)
          obj.ParseFromDict(row)
          if modifier:
            modifier(obj)
          objects_to_put += [obj]
      for key, row in old_rows.items():
        if key in new_rows:
          continue
        else:
          keys_to_delete += [ndb.Key(cls, key)]

    logging.info('Putting %d objects' % len(objects_to_put))
    while objects_to_put:
      batch_size = 5000
      logging.info('%d left' % len(objects_to_put))
      subslice = objects_to_put[:batch_size]
      objects_to_put = objects_to_put[batch_size:]
      with client.context():
        ndb.put_multi(subslice)

    logging.info('Deleting %d objects' % len(keys_to_delete))
    client = ndb.Client()
    with client.context():
      ndb.delete_multi(keys_to_delete)


def main(argv):
  old_export_path = FLAGS.export_base + FLAGS.old_export_id
  new_export_path = FLAGS.export_base + FLAGS.new_export_id

  logging.info(old_export_path)
  logging.info(new_export_path)

  # A new client context is created for each write here, to avoid a memory leak.
  process_export(old_export_path, new_export_path)

  client = ndb.Client()
  with client.context():
    set_latest_export(FLAGS.new_export_id)
    UpdateChampionships()
    UpdateChampions()
    UpdateStateRecords()
    EmailChampionshipOrganizers()

if __name__ == '__main__':
  app.run(main)
